<?php

namespace Drupal\milken_migrate\Plugin\migrate\destination;

use Drupal\Component\Serialization\Json;
use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\eck\EckEntityInterface;
use Drupal\media\MediaInterface;
use Drupal\migrate\MigrateException;
use Drupal\migrate\Plugin\MigrateIdMapInterface;
use Drupal\migrate\Plugin\MigrationInterface;
use Drupal\migrate\Row;
use Drupal\milken_migrate\JsonAPIReference;
use Drupal\paragraphs\ParagraphInterface;

/**
 * Provides Event destination.
 *
 * Use this plugin for a table not registered with Drupal Schema API.
 *
 * @MigrateDestination(
 *   id = "milken_migrate:event",
 * )
 */
class Event extends MilkenMigrateDestinationBase implements ContainerFactoryPluginInterface {

  /**
   * {@inheritDoc}
   */
  public function fields(MigrationInterface $migration = NULL) {
    $defs = $this->container->get('entity_field.manager')
      ->getFieldDefinitions('event', 'conference');
    $toReturn = [];
    foreach ($defs as $field_id => $fieldInfo) {
      $toReturn[$fieldInfo->label] = $field_id;
    }
    return $toReturn;
  }

  /**
   * Get id of entity to which we're migrating.
   *
   * @param \Drupal\migrate\Row $row
   *   Row data.
   *
   * @return string
   *   Returns the value of the property 'id'.
   */
  protected function getEntityId(Row $row) {
    return strtolower($row->getSourceProperty('id'));
  }

  /**
   * {@inheritdoc}
   */
  public function import(Row $row, array $old_destination_id_values = []) {
    $this->logger->debug('Importing:' . print_r($row, TRUE));
    $this->rollbackAction = MigrateIdMapInterface::ROLLBACK_DELETE;
    $entity = $this->getEntity($row, $old_destination_id_values);
    if (!$entity instanceof EckEntityInterface) {
      return new MigrateException('Unable to get Event');
    }
    $this->setRelatedFields($row, $entity);
    $this->logger->debug('Related Fields set:' . print_r($row, TRUE));
    if ($this->isEntityValidationRequired($entity)) {
      $this->validateEntity($entity);
    }
    $this->logger
      ->debug('saving these values:' . print_r($entity->toArray(), TRUE));
    $ids = $this->save($entity, $old_destination_id_values);
    $map['destid1'] = $entity->id();
    $row->setIdMap($map);
    $this->setRollbackAction($map,
      $entity->isNew() ?
        MigrateIdMapInterface::ROLLBACK_DELETE :
        MigrateIdMapInterface::ROLLBACK_PRESERVE
    );
    return $ids;
  }

  /**
   * Creates or loads an entity.
   *
   * @param \Drupal\migrate\Row $row
   *   The row object.
   * @param array $old_destination_id_values
   *   The old destination IDs.
   *
   * @return \Drupal\Core\Entity\EntityInterface
   *   The entity we are importing into.
   */
  protected function getEntity(Row $row, array $old_destination_id_values) {
    $entity_id = $this->getEntityId($row);
    $this->logger->debug('=> GET ENTITY: entity id:' . $entity_id);
    $exists = $this->storage->getQuery()
      ->condition('field_grid_event_id', $entity_id)
      ->execute();
    if (count($exists)) {
      $this->logger->debug("Entity exists in DB, retrieving....");
      $entity = $this->storage->load(reset($exists));
      // Allow updateEntity() to change the entity.
      $this->logger->debug('Entity Loaded, updating...' . $entity->toArray());
      $entity = $this->updateEntity($entity, $row) ?: $entity;
    }
    else {
      $this->logger->debug("Entity doesn't exist in DB, creating....");
      // Attempt to ensure we always have a bundle.
      if ($bundle = $this->getBundle($row)) {
        $row->setDestinationProperty($this->getKey('bundle'), $bundle);
      }

      // Stubs might need some required fields filled in.
      if ($row->isStub()) {
        $this->processStubRow($row);
      }
      $entity = $this->storage->create($row->getDestination());
      $entity->enforceIsNew();
      $this->logger->debug('entity created:' . print_r($entity->toArray(), TRUE));
    }
    return $entity;
  }

  /**
   * {@inheritdoc}
   */
  public function getBundle(Row $row) {
    switch (strtolower($row->get('type'))) {
      case "finLabs":
      case "mia":
      case "p4c":
        return "meeting";

      case "summit":
        return "summit";

      case "gc":
        return "conference";

      default:
        return NULL;
    }
  }

  /**
   * {@inheritdoc}
   */
  public function setRelatedFields(Row $row, EntityInterface $entity): EntityInterface {
    $this->logger->debug("setting related fields: " . $entity->id());
    try {
      // Query the live site and get data for the event.
      $gridID = strtolower($row->getSourceProperty('id'));
      $this->logger->debug("Grid ID: " . $gridID);
      $url = "https://milkeninstitute.org/jsonapi/node/event?jsonapi_include=true&filter[field_grid_event_id]={$gridID}";
      $url .= "&include=field_event_header_image,field_event_video_still,field_event_image,field_event_live_info,";
      $url .= "field_event_live_info.field_social_network,field_event_summary_image";
      $response = \Drupal::httpClient()->get($url);

      // If Data exists for the Event, process it.
      $list = Json::decode($response->getBody());
      $this->logger->debug("Returned Node List " . print_r($list, TRUE));

      if (is_array($list['data']) && count($list['data']) === 1) {
        $remoteEvent = array_shift($list['data']);
        $this->logger->debug("Remote Event " . print_r($remoteEvent, TRUE));

        // VENUE.
        if (is_array($remoteEvent['field_event_address'])
          && !empty($remoteEvent['field_event_address'])) {
          $entity->set('field_venue', $this->getLocationRef($remoteEvent['field_event_address']));
        }

        // METATAGS.
        if (!empty($remoteEvent['field_meta_tags'])) {
          $entity->set('field_meta_tags', $remoteEvent['field_meta_tags']);
        }

        // HEADER IMAGEl
        if (!array_key_exists('data', $remoteEvent['field_event_header_image'])
          && !empty($remoteEvent['field_event_header_image'])) {
          $mediaHandle = $this->addMedia($remoteEvent['field_event_header_image']);
          if ($mediaHandle instanceof MediaInterface) {
            $entity->set('field_hero_image', [
              'target_id' => $mediaHandle->getSource()->getSourceFieldValue($mediaHandle),
            ]);
          }
          $entity->field_related_media[] = ['target_id' => $mediaHandle->id()];
        }

        // TITLE CARD IMAGE.
        if (!array_key_exists('data', $remoteEvent['field_event_image'])
          && !empty($remoteEvent['field_event_image'])) {
          $mediaHandle = $this->addMedia($remoteEvent['field_event_image']);

          if ($mediaHandle instanceof MediaInterface) {
            $entity->set('field_title_card_image', [
              'target_id' => $mediaHandle->getSource()->getSourceFieldValue($mediaHandle),
            ]);
            $eventImage = $mediaHandle;
          }
          $entity->field_related_media[] = [ 'target_id' => $mediaHandle->id() ];
        }
        $titleCardImage = $entity->get('field_title_card_image')->value;

        // SUMMARY IMAGE.
        if (!array_key_exists('data', $remoteEvent['field_event_summary_image'])
          && !empty($remoteEvent['field_event_summary_image'])) {
          $mediaHandle = $this->addMedia($remoteEvent['field_event_summary_image']);
          if ($mediaHandle instanceof MediaInterface && empty($titleCardImage)) {
            $entity->set('field_title_card_image', [
              'target_id' => $mediaHandle->getSource()->getSourceFieldValue($mediaHandle),
            ]);
            $eventImage = $mediaHandle;
          }
          $entity->field_related_media[] = ['target_id' => $mediaHandle->id()];
        }

        // VIDEO STILL.
        if (!array_key_exists('data', $remoteEvent['field_event_video_still'])
          && !empty($remoteEvent['field_event_video_still'])) {
          $mediaHandle = $this->addMedia($remoteEvent['field_event_video_still']);
          if ($mediaHandle instanceof MediaInterface && empty($titleCardImage)) {
            $entity->set('field_title_card_image', [
              'target_id' => $mediaHandle->getSource()->getSourceFieldValue($mediaHandle),
            ]);
          }
          $entity->field_related_media[] = ['target_id' => $mediaHandle->id()];
        }

        // SOCIAL NETWORK LINKS.
        if (!empty($remoteEvent['field_event_live_info'])) {
          $to_set = $entity->get('field_social_network_links')->value ?? [];
          $this->logger->debug("Social Network Links:" . print_r($to_set));
          foreach ($remoteEvent['field_event_live_info'] as $social_link) {
            if (isset($social_link['field_url']['uri']) && trim($social_link['field_url']['uri']) !== "") {
              $to_set[] = [
                "key" => (trim($social_link['field_url']['title']) !== "")
                  ? trim($social_link['field_url']['title']) : $social_link['field_social_network']['name'],
                "value" => $social_link['field_url']['uri'],
              ];
            }
          }
          if (isset($remoteEvent['field_event_flickr_url']['uri'])) {
            $to_set[] = [
              'key' => "Flickr",
              'value' => $remoteEvent['field_event_flickr_url']['uri'],
            ];
          }
          $this->logger->debug("field_social_network_links =>" . print_r($to_set, TRUE));
          $entity->set('field_social_network_links', $to_set);
        }

        // OVERVIEW TAB.
        if ($remoteEvent['field_enable_program_overview'] === TRUE) {
          $entity->field_content_tabs[] = $this->createTab('Overview', $remoteEvent['field_event_featured_content']);
        }

        // PROGRAM TAB.
        if ($remoteEvent['field_enable_program_details'] === TRUE) {
          $entity->field_content_tabs[] = $this->createTab('Program', $remoteEvent['field_poi_featured_content_1']);
        }
        $this->logger->debug("Saving entity:" . print_r($entity->toArray(), TRUE));
        $entity->save();
        $this->logger->debug("Entity saved" . print_r($entity->toArray(), TRUE));
      }
    } catch (\Exception $e) {
      echo $e->getMessage();
      exit($e->getTraceAsString());
    }
    return $entity;
  }

  /**
   * @param array $fieldData
   *
   * @return \Drupal\media\MediaInterface
   * @throws \Drupal\Core\Entity\EntityStorageException
   * @throws \Drupal\migrate\MigrateException
   */
  public function addMedia(array $fieldData): MediaInterface {
    $this->logger
      ->debug("addMedia =>" . print_r($fieldData, TRUE));
    if (!empty($fieldData)) {
      if (!isset($fieldData['type']) && isset(reset($fieldData)['type'])) {
        $fieldData = array_shift($fieldData);
      }
    }
    $ref = new JsonAPIReference($fieldData);
    $this->logger->debug("Add Media Ref:" . print_r($ref, TRUE));
    $fileHandle = $ref->getRemote();
    $fileHandle->save();
    $mediaHandle = $this->createMedia($fileHandle->label(), [
      'field_media_image' => $fileHandle,
      'bundle' => 'image',
    ]);
    $mediaHandle->save();
    $this->logger->debug("Media Created:" . print_r($mediaHandle->toArray(), TRUE));
    return $mediaHandle;
  }

  /**
   * Do the work of moving an event tab from the old site to new.
   *
   * @param string $tabName
   *   Name for the new tab.
   * @param array $paragraph_field
   *   Field data from the old site.
   *
   * @return ParagraphInterface
   *   A new paragraph TAB instance.
   *
   * @throws \Drupal\Core\Entity\EntityStorageException
   */
  public function createTab(string $tabName, array $paragraph_field): ParagraphInterface {
    // .9 create new paragraph tab with the string TabName as the ID.
    $paragraph_storage = $this->container
      ->get('entity_type.manager')
      ->getStorage('paragraph');
    $paragraph_tab = $paragraph_storage->create([
      'type' => 'paragraph_tab',
      'name' => $tabName,
      'title' => $tabName,
    ]);
    // Loop over the $paragraph_field.
    foreach ($paragraph_field as $paragraph) {
      // Search for local paragraph replica via uuid.
      $results = $paragraph_storage->loadByProperties(['uuid' => $paragraph['id']]);
      if (count($results)
        && $result = array_shift($results)
          && $result instanceof ParagraphInterface) {
        // 3. If does exist, save references to the paragraphs in the
        //    newly-created tab.
        $paragraph_tab->field_tab_contents[] = [
          'target_id' => $result->id(),
          'revision_id' => $result->getRevisionId(),
        ];
        $this->logger->debug("Paragraph Tab:" . print_r($paragraph_tab->field_tab_contents, TRUE));
      }
      else {
        $this->logger->debug("Unmigrated Paragraph Tab:" . print_r($paragraph, TRUE));
      }
      // 5. Save Paragraph Tab.
      $paragraph_tab->save();
    }
    // return the tab
    return $paragraph_tab;
  }

  /**
   * Import the location relationship.
   *
   * @param \Drupal\Core\Entity\EntityInterface $entity
   *   The Event Entity.
   * @param array $remoteData
   *   Remote Data from the live site.
   *
   * @return array
   *   Array reference.
   */
  public function getLocationRef(array $address) {
    // Does location exist?
    $address = array_filter($address);
    $this->logger->debug("Importing address" . print_r($address, TRUE));
    if (empty($address)) {
      return FALSE;
    }
    $address_label = $address['address_line1'] ?? "Office";
    $this->logger->debug("Address Label:" . $address_label);
    $address['address_line1'] = $address['address_line2'];
    unset($address['address_line2']);
    $location_storage = $this->container
      ->get('entity_type.manager')
      ->getStorage('location');
    $results = $location_storage->loadByProperties(['title' => $address_label]);
    $this->logger->debug("Address Query Result count:" . count($results));
    if (count($results)) {
      // If YES, reference it in the entity and save.
      $location = array_shift($results);
    }
    else {
      // If not, create it.
      $location = $location_storage->create([
        'type' => 'conference_center',
        'field_address' => $address,
        'title' => $address_label,
      ]);
      $location->save();
      $this->logger->debug('Location Created' . print_r($location->toArray(), TRUE));
    }
    return ['target_id' => $location->id()];
  }

  /**
   * Create media object from File reference.
   *
   * @param string $name
   *   Title field of the newly created media object.
   * @param array $details
   *   File reference and metadata.
   *
   * @return \Drupal\media\MediaInterface
   *   A newly-created entity object.
   *
   * @throws \Drupal\migrate\MigrateException
   */
  protected function createMedia(string $name, array $details): MediaInterface {
    try {
      $media = $this->container
        ->get('entity_type.manager')
        ->getStorage('media')
        ->create($details);
      $this->logger->debug("Media Object: " . print_r($media->toArray(), TRUE));
      $media->setName($name)
        ->setPublished(TRUE)
        ->save();
      $this->logger->debug("Saved. Media ID: " . $media->id());
      return $media;
    } catch (\Exception $e) {
      $this->logger->error("Cannot save media object" . print_r($details, TRUE));
      throw new MigrateException("Yeah, this isn't work for me. Can we just be entityFriends?");
    }
    return NULL;
  }

}
