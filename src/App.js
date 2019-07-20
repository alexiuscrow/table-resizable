import React from 'react';
import {Container} from 'reactstrap';
import TableResizable from "./TableResizable";

const onClickHeader = (e) => {
  console.log('Clicked header', e.currentTarget.attributes['data-index'].value);
};

function App() {
  return (
    <div className="App">
      <Container className="mt-5">
          <TableResizable
              initColWidth={['10%', '30%', '70%']}
              headers={[
                  {content: 'Head 1', props: {'data-index': 1, onClick: onClickHeader}},
                  {content: 'Head 2', props: {'data-index': 2, onClick: onClickHeader}},
                  {content: 'Head 3', props: {'data-index': 3, onClick: onClickHeader}}
              ]}
              rows={[
                  [
                      {content: 'Row 1 Column 1',  props: {'data-row': 1,'data-column': 1}},
                      {content: 'Row 1 Column 2',  props: {'data-row': 1,'data-column': 2}},
                      {content: 'Row 1 Column 3',  props: {'data-row': 1,'data-column': 3}},
                  ],
                  [
                      {content: 'Row 2 Column 1',  props: {'data-row': 2,'data-column': 1}},
                      {content: 'Row 2 Column 2',  props: {'data-row': 2,'data-column': 2}},
                      {content: 'Row 2 Column 3',  props: {'data-row': 2,'data-column': 3}},
                  ],
                  [
                      {content: 'Row 3 Column 1',  props: {'data-row': 3,'data-column': 1}},
                      {content: 'Row 3 Column 2',  props: {'data-row': 3,'data-column': 2}},
                      {content: 'Row 3 Column 3',  props: {'data-row': 3,'data-column': 3}},
                  ]
              ]}
              striped bordered hover/>
      </Container>
    </div>
  );
}

export default App;
