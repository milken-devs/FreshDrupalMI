import React from 'react';
import 'icheck/skins/all.css';
import {Checkbox} from 'react-icheck';
import $ from 'jquery';
import styled from "styled-components";

const FiltersWrapper = styled.div`
    border: 1px solid #b9b9b9;
    & .external{
        padding: 10px;
    }
    & .block-title{
        font-size: 17px;
    }
    & .filter{
        padding: 5px 10px;
        background: white;
        height: 45px;
    }
    & .external .setting{
        display:block;
    }
    & .filter table tr {
        background: none;
    }
    & .filter table tr td:first-child{
        width: 15%;
    }
    & .filter table tr td:nth-child(2){
        width: 85%;
    }
    & table{
        width: 100%;
        height: 100%;
        margin: 0px;
    }
    & .filter table tr td > div { 
        height: 20px;
    }
    & .filter table tr td > div > input {
        opacity: 1 !important;
        width: 100% !important;
        height: 100% !important;
    }
    & .filter-desc label{
        font-size: 12px;
        color: #35363c;
        cursor: pointer;
    }
`;
const Filters = ({filters, resetPeople, selectedFilters, type}) => {

    const handleCheck = (e, checked) => {
        var checker = "";
        if(type == 'topics') checker = "td.centerandgroups .icheckbox_square-red";
        else checker = "td.topics .icheckbox_square-red";
        
        // $(checker).each(function(){
        //     if($(this).attr("class").includes("checked")){
        //         window.$(this).children("input").trigger("click");
        //     }
        // });
        if(checked){
            selectedFilters.push(e.target.value);
        } else{
            const index = selectedFilters.indexOf(e.target.value);
            if (index > -1) {
                selectedFilters.splice(index, 1);
            }
        }
        resetPeople(selectedFilters);
    }
    return (
        <FiltersWrapper className="form-group filter-sidebar-1">
            <div className="external">
                <h3 className="bold caption text-left block-title">{type == 'topics' ? `TOPICS` : 'CENTERS AND GROUPS'}</h3>
                <span className="setting text-left">
                    <a>Select all |</a>
                    <a> Reset</a>
                </span>
            </div>
            {filters.map((filter, index) => (
                <div className="text-left filter" key={index}>													
                    <table>
                        <tbody>
                            <tr>
                            <td className={type}>
                                <Checkbox
                                id={type + index}
                                checkboxClass="icheckbox_square-red"
                                increaseArea="20%"
                                value={filter.split(":")[0]}
                                onChange = {handleCheck}
                                />
                            </td>
                            <td className="filter-desc"><label htmlFor={type + index}>{filter.split(":")[0]} ({filter.split(":")[1]})</label></td>
                            </tr>    
                        </tbody>
                    </table>     
                </div>                
            ))}
       </FiltersWrapper>
    )
};
export default Filters;