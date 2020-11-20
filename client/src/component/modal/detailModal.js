import React from 'react';
import { Modal, Button, Input } from 'antd';
import 'antd/dist/antd.css';


const DetailModal = (props) => {
  
  return (

    <Modal
      visible={props.visible}
      title="상세검색"
      // onOk={this.handleOk}
      // onCancel={this.handleCancel}
      footer={[    
        <Button key="submit" type="primary" onClick={props.search}>
          검 색
        </Button>,
        <Button key="close" onClick={props.close}>
          취 소
        </Button>,
      ]}
    > <p></p>
      <p><Input /></p>
      <p>기본 검색어 <Input type="text" /></p>
      <p>정확히 일치하는 단어/문장 <Input type="text" /></p>
      <p>반드시 포함하는 단어(+) <Input type="text" /></p>
      <p>제외하는 단어(-) <Input type="text" /></p>
    </Modal>
  )
}


export default DetailModal;