import React from 'react'
import axios from "axios";
import { useState, useRef } from 'react';
import { Modal, Radio, DatePicker, Input, Col, Row, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import 'antd/dist/antd.css';
import "./index.css";
// import ReactHtmlParser, { processNodes, convertNodeToElement, htmlparser2 } from 'react-html-parser';



const Testdiv = (props) => {

    const searchText = useRef(false);
    const gtePrice = useRef(false);
    const ltePrice = useRef(false);
    const basicQuery = useRef(false);
    const matchQuery = useRef("");
    const mustQuery = useRef("");
    const mustNotQuery = useRef("");
    const [Result, setResult] = useState("");
    const [Count, setCount] = useState("");
    const [Filter, setFilter] = useState("");
    const [fields, setFields] = useState({
        query: searchText.current.value, match: '', must: '', mustNot: '', field: 'all',
        sort: 'default', gteDate: 'all', lteDate: '', gtePrice: '', ltePrice: ''
    })


    const getResut = async () => {
        await axios.post('/api/search', fields)
            .then((Response) => {
                const hits = Response.data;
                // console.log(JSON.stringify(hits));
                setResult(hits);
                setCount(hits.length);
            })
    }


    const filtering = async () => {
        
        // console.log(fields);
        fields.query = searchText.current.value;
        setFields(fields);

        await axios.post('/api/search', fields)
            .then((Response) => {
                const hits = Response.data;
                if (hits.length === 0) {
                    setFilter("해당 필터 조건에 대한 결과가 없습니다.");
                    setResult('');
                    setCount('0');
                } else {
                    setFilter("");
                    setResult(hits);
                    setCount(hits.length);
                }

            })
    }

    const onSearch = () => {

        fields.query = searchText.current.value;
        fields.match = '';
        fields.must = '';
        fields.mustNot = '';
        // console.log(mustNotQuery.current.value);
        // mustNotQuery.current.value = '';
        // mustQuery.current.value = '';
        // matchQuery.current.value = '';

        setFields(fields);
        getResut();
    }

    const appKeyPress = (e) => {
        if (e.key === 'Enter') {
            onSearch();
        }
    }

    const handleSort = (e) => {
        fields.sort = e.target.value;
        setFields(fields);
        filtering();
    };

    const handleRangeDate = (e) => {
        fields.gteDate = e.target.value;
        setFields(fields);
        filtering();
    };

    const handleGteDate = (dateString) => {
        fields.gteDate = dateString;
        setFields(fields);
    }

    const handleLteDate = (dateString) => {
        fields.lteDate = dateString;
        setFields(fields);
    }

    const onChangeDate = (e) => {

        if (fields.gteDate && fields.lteDate) {
            filtering();
        } else if (fields.gteDate || fields.lteDate) {
            alert("기간을 정확히 설정해 주세요.");
        } else {
            fields.gteDate = 'all';
            fields.lteDate = '';
            setFields(fields);

            filtering();
        }

    }

    const onRangePrice = () => {
        if (ltePrice.current.value !== '' && gtePrice.current.value !== '') {
            fields.gtePrice = gtePrice.current.value;
            fields.ltePrice = ltePrice.current.value;
        }
        filtering();
    }


    const handleRangeField = (e) => {
        fields.field = e.target.value;
        setFields(fields);
        filtering();
    };

    // modal
    const [modal, setModal] = useState({
        visible: false,
    });

    const openModal = () => {
        setModal({
            visible: !modal.visible
        });
    }

    const handleOk = e => {
        setModal({
            visible: false,
        });
    };

    const handleCancel = e => {
        setModal({
            visible: false,
        });
    };

    const onDetailSearch = () => {
        if (basicQuery.current.value) {
            fields.query = basicQuery.current.value;
            searchText.current.value = basicQuery.current.value;
        } else {
            fields.query = searchText.current.value;
        }

        fields.match = matchQuery.current.value;
        fields.must = mustQuery.current.value;
        fields.mustNot = mustNotQuery.current.value;

        setFields(fields);
        setModal({
            visible: false,
        });

        getResut();
    }




    return (
        <div className="body">

            <input className="inputText" style={{ width: 350 }} placeholder={"검색어를 입력하세요."} ref={searchText} onKeyPress={appKeyPress} />
            <Button type="primary" icon={<SearchOutlined />} style={{ marginRight: '20px' }} />
            <Button shape="circle" onClick={() => openModal()}>
                v
            </Button> <small>상세 검색</small>
            <hr />
            {
                Filter ?
                    '' : <div>'{searchText.current.value}' 에 대한 검색 결과는 {Count}건 입니다.</div>
            }

            <br />
            <div className="container">
                <div className="result" >
                    {Filter}
                    <table>
                        {
                            Count != 0 ? <th style={{ backgroundColor: 'gray', color: 'white' }}>도서목록({Count}건)</th> : ''
                        }

                        {
                            Result ?
                                Result.map((sources, index) => {
                                    return (
                                        <tr key={index}>
                                            <td>


                                                {sources.highlight ?
                                                    sources.highlight['title.kobrick'] ?
                                                        <a><span dangerouslySetInnerHTML={{ __html: sources.highlight['title.kobrick'] }}></span></a> : <a> {sources._source.title}</a>
                                                    : <a> {sources._source.title}</a>
                                                }
                                                <br />
                                                {
                                                    sources.highlight ?

                                                        sources.highlight['content.kobrick'] ?
                                                            <span dangerouslySetInnerHTML={{ __html: sources.highlight['content.kobrick'] }}></span> : sources._source.content
                                                        : sources._source.content

                                                }
                                                <br />

                                                <p>
                                                    <small>출판사 : </small>
                                                    {
                                                        sources.highlight ?

                                                            sources.highlight['published_by.kobrick'] ?
                                                                <span dangerouslySetInnerHTML={{ __html: sources.highlight['published_by.kobrick'] }}></span>
                                                                : sources._source.published_by
                                                            : sources._source.published_by

                                                    }
                                                    &nbsp;&nbsp;

                                                    <small>출판일  : </small>
                                                    {sources._source.pub_year_month}
                                                    &nbsp;&nbsp;

                                                    <small>카테고리 : </small>
                                                    {
                                                        sources.highlight ?

                                                            sources.highlight['category.kobrick'] ?
                                                                <span dangerouslySetInnerHTML={{ __html: sources.highlight['category.kobrick'] }}></span>
                                                                : sources._source.category
                                                            : sources._source.category

                                                    }
                                                    &nbsp;&nbsp;

                                                    <small>가격 : </small>
                                                    {sources._source.price}
                                                    &nbsp;&nbsp;
                                                </p>
                                                <hr />
                                            </td>
                                        </tr>
                                    )
                                }) : ''
                        }


                    </table>
                </div>

                {
                    Count ?
                        <div className="filter">
                            <hr />
                            <div>
                                결과정렬 <br />
                                <Radio.Group value={fields.sort} onChange={handleSort}>
                                    <Radio.Button value="default">정확도</Radio.Button>
                                    <Radio.Button value="sort">최신순</Radio.Button>
                                </Radio.Group>

                            </div>
                            <hr />
                            <div>
                                기간 <br />
                                <Radio.Group value={fields.gteDate} onChange={handleRangeDate}>
                                    <Radio.Button value="all" >전체</Radio.Button>
                                    <Radio.Button value="now-1d/d" >1일</Radio.Button>
                                    <Radio.Button value="now-7d/d" >1주</Radio.Button> <br />
                                    <Radio.Button value="now-1M/d" >1개월</Radio.Button>
                                    <Radio.Button value="now-1y/d" >1년</Radio.Button>
                                </Radio.Group>
                                <br /><br />
                                {/* rangepicker */}
                                <Row gutter={5}>
                                    <Col span={8}>
                                        <DatePicker onChange={handleGteDate} />
                                    </Col>
                                    <Col span={1}>
                                        ~
                                    </Col>
                                    <Col span={8}>
                                        <DatePicker onChange={handleLteDate} />
                                    </Col>
                                    <Col span={6}>
                                        <Button onClick={onChangeDate}>적용</Button>
                                    </Col>
                                </Row>

                            </div>
                            <hr />
                            <div>
                                가격 <br />
                                <div className="site-input-group-wrapper">
                                    <Input.Group>
                                        <Row gutter={5}>
                                            <Col span={8}>
                                                <input className="inputText" ref={gtePrice} />
                                            </Col>
                                             ~
                                            <Col span={8}>
                                                <input className="inputText" ref={ltePrice} />
                                            </Col>
                                            <Col span={5}>
                                                <Button onClick={() => onRangePrice()}>적용</Button>
                                            </Col>
                                        </Row>
                                    </Input.Group>
                                </div>
                            </div>
                            <hr />
                            <div>
                                검색영역 <br />
                                <Radio.Group value={fields.field} onChange={handleRangeField}>
                                    <Radio.Button value="all">전체</Radio.Button>
                                    <Radio.Button value="title">제목</Radio.Button>
                                    <Radio.Button value="content">본문</Radio.Button> <br />
                                    <Radio.Button value="published_by">출판사</Radio.Button>
                                    <Radio.Button value="category">카테고리</Radio.Button>
                                </Radio.Group>
                            </div>
                            <hr />
                        </div>
                        : ''
                }

            </div>
            <Modal
                visible={modal.visible}
                title="상세검색"
                onOk={handleOk}
                onCancel={handleCancel}
                footer={[
                    <Button key="submit" type="primary" onClick={onDetailSearch}>
                        검 색
                  </Button>,
                    <Button key="close" onClick={handleCancel}>
                        취 소
                  </Button>,
                ]}
            > <p><Input type="text" value={searchText.current.value} /></p>
                <p>기본 검색어 <input className="inputText" type="text" ref={basicQuery} /></p>
                <p>정확히 일치하는 단어/문장 <input className="inputText" type="text" ref={matchQuery} /></p>
                <p>반드시 포함하는 단어(+) <input className="inputText" type="text" ref={mustQuery} /></p>
                <p>제외하는 단어(-) <input className="inputText" type="text" ref={mustNotQuery} /></p>
                <small>* 여러 개의 단어를 입력할 때는 쉼표(,)로 구분해서 입력합니다.</small>
            </Modal>
        </div>
    )
}


function index() {

    return (
        <Testdiv/>
    )
}

export default index
