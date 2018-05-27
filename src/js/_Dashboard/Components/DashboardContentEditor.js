import React, { Component } from 'react';

import { default as EditBox } from './DashboardEditBox';
import SingleInputManager from "./Inputs/DashboardDateManager";
import MapStages from "./Inputs/DashboardMapStages";
import Gallery from "./Inputs/DashboardGallery";
import ListInput from "./Inputs/DashboardListInput";

class DashboardContentEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeEditBoxID: null,
      submited: false
    };
    this.data = [];
    this._handleSubmit = this._handleSubmit.bind(this);
    this._handleInputData = this._handleInputData.bind(this);
    this._toggleSubbmit = this._toggleSubbmit.bind(this);
  }

  _handleSubmit(data) {
    this.setState({ submited: true });
  }

  _toggleSubbmit(submit, activeEditBox){
    if (submit) this.setState({ submited: submit });
    else if (typeof activeEditBox === 'number') this.setState({activeEditBoxID: activeEditBox});
  }

  _handleInputData(data, path) {
    let url = this.props.match.url.replace("/dashboard/panel", "");
    if (path) url += '/' + path;
    this.props.submit(url, data);
    this.setState({submited: false});
  }

  render() {
    const pageTitle = this.props.match.url.split('/')[this.props.match.url.split('/').length -1];
    let data = this.props.content.data;
    const structure = this.props.structure;
    const props = this.props;
    let inputs = [];
    let editBoxID = 0;


    if (data.length > 1) {
      data = data.filter(obj => (
        obj.id === parseInt(props.match.params.id, 10)
      ));
      data = data[0];
    }

    for (let i in structure) {
      if (i !== "structure") {
        let expanded = false;
        if (this.state.activeEditBoxID === editBoxID)
          expanded = true;

        // Render component for each child in structure. Check type of component and render specific definded for it
        switch(structure[i].type) {
          case "date":
            inputs.push(
              <EditBox key={i} id={editBoxID} expanded={expanded} structure={structure[i]} data={data[i]} match={this.props.match.url} changer={this._toggleSubbmit} >
                <SingleInputManager
                  description={structure[i].description}
                  date={data[i]}
                  node={i}
                  submitData={this._handleInputData}
                  structure={structure[i]}
                  submit={this.state.submited}
                />
              </EditBox>
            );
            break;
          case "map-place":
            inputs.push(
              <EditBox key={i} id={editBoxID} expanded={expanded} structure={structure[i]} data={data[i]} match={this.props.match.url} changer={this._toggleSubbmit} >
                <MapStages
                  id={`input-${i}`}
                  group={i}
                  structure={structure[i]}
                  content={data[i]}
                  submit={this.state.submited}
                  submitData={this._handleInputData}
                />
              </EditBox>
            );
            break;
          case "short-text":
            inputs.push(
              <EditBox key={i} id={editBoxID} expanded={expanded} structure={structure[i]} data={data[i]} match={this.props.match.url} changer={this._toggleSubbmit} >
                <SingleInputManager
                  description={structure[i].description}
                  date={data[i]}
                  node={i}
                  submitData={this._handleInputData}
                  submit={this.state.submited}
                  structure={structure[i]}
                />
              </EditBox>
            );
            break;
          case "gallery":
            inputs.push(
              <EditBox key={i} id={editBoxID} expanded={expanded} structure={structure[i]} data={data[i]} match={this.props.match.url} changer={this._toggleSubbmit} >
                <Gallery
                  id={`input-${i}`}
                  group={i}
                  structure={structure[i]}
                  content={data[i]}
                  submit={this.state.submited}
                  submitData={this._handleInputData}
                />
              </EditBox>
             );
            break;
          case "tag":
            inputs.push(
              <EditBox key={i} id={editBoxID} expanded={expanded} structure={structure[i]} data={data[i]} match={this.props.match.url} changer={this._toggleSubbmit} >
                <ListInput
                  id={`input-${i}`}
                  group={i}
                  submit={this.state.submited}
                  value={data[i]}
                  description={structure[i].description}
                  submitData={this._handleInputData}
                />
              </EditBox>
            );
            break;
          case "list":
            inputs.push(<EditBox key={i} id={editBoxID} expanded={expanded} structure={structure[i]} data={data[i]} match={this.props.match.url} changer={this._toggleSubbmit} /> );
            break;
          default:
        }
        editBoxID++;
      }
    }

    return (
      <div className="dashboard__contentEditor">
        <h2> Content editor </h2>
        <h4> page: {pageTitle} </h4>
        <div className="contentEditor__form">
          {inputs}
        </div>
      </div>
    );
  }
}

export default DashboardContentEditor;
