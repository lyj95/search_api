import React from 'react'
import { useState, useRef, useEffect } from 'react';
import { Modal, Radio, DatePicker, Input, Col, Row, Button } from 'antd';
import 'antd/dist/antd.css';
// import DetailModal from '../../component/modal/detailModal';
// import Modal from 'antd/lib/modal/Modal';
import axios from "axios";
import "./index.css";




const Testdiv = (props) => {
    const searchText = useRef(false);
    // const [Text, setText] = useState("");
    const [Result, setResult] = useState("");
    const [Count, setCount] = useState("");

    let params = {
        query: searchText.current.value, match: '', must: '', mustNot: '', field: 'all',
        sort: '', gteDate: '', lteDate: '', gtePrice: '', ltePrice: ''
    };

    const getResut = async () => {
        await axios.post('/api/search', params)
            .then((Response) => {
                const hits = Response.data;

                setResult(hits);
                setCount(hits.length);
            })
    }

    const [Filter, setFilter] = useState("");
    const filtering = async () => {
        await axios.post('/api/search', params)
            .then((Response) => {
                const hits = Response.data;

                if (hits.length == 0) {
                    setFilter("해당 필터 조건에 대한 결과가 없습니다.");
                    setResult('');
                    setCount('');
                } else {
                    setResult(hits);
                    setCount(hits.length);
                }

            })
    }

    const onSearch = () => {
        params.query = searchText.current.value;
        getResut();
    }

    const appKeyPress = (e) => {
        if (e.key === 'Enter') {
            onSearch();
        }
    }

    const [sort, setSort] = React.useState('default');
    const handleSort = (e) => {
        if (e.target.value === 'latest') {
            params.sort = 'sort';
        }
        filtering();
        setSort(e.target.value)
    };

    const [date, setDate] = React.useState('all');
    const handleRangeDate = (e) => {

        if (e.target.value !== 'all') {
            params.gteDate = e.target.value;
        }

        filtering();
        setDate(e.target.value)
    };

    const { RangePicker } = DatePicker;


    let gtePrice = useRef(false);
    let ltePrice = useRef(false);

    const onRangePrice = () => {
        if (ltePrice.current.value !== null && gtePrice.current.value !== null) {
            params.gtePrice = String(gtePrice);
            params.ltePrice = String(ltePrice);
        }
        filtering();
    }


    const [field, setField] = React.useState('all');
    const handleRangeField = (e) => {
        if (e.target.value !== 'all') {
            params.field = e.target.value;
        }
        filtering();
        setField(e.target.value)
    };

    const [modal, setModal] = useState({
        visible: false,
    });
    const openModal = (data) => {
        setModal({
            visible: !modal.visible
        })
    }



    // modal

    const basicQuery = useRef(false);
    const matchQuery = useRef(false);
    const mustQuery = useRef(false);
    const mustNotQuery = useRef(false);


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
        params.query = basicQuery.current.value;
        params.match = matchQuery.current.value;
        params.must = mustQuery.current.value;
        params.mustNot = mustNotQuery.current.value;
        searchText.current.value = basicQuery.current.value;
        setModal({
            visible: false,
        });
        getResut();
    }

    const handleGteDate = (dateString) => {
        params.gteDate = dateString;
    }
    const handleLteDate = (dateString) => {
        params.lteDate = dateString;
    }
    const onChangeDate = (e) => {

        if (params.gteDate && params.lteDate) {
            filtering();
        } else {
            alert("기간을 설정해 주세요.");
        }

    }


    return (
        <div className="body">

            <input className="inputText" style={{ width: 350 }} placeholder={"검색어를 입력하세요."} ref={searchText} />
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
                            Count != 0 ? <th>도서목록({Count}건)</th> : ''
                        }

                        {
                            Result ?
                                Result.map((sources, index) => {
                                    return (
                                        <tr key={index}>
                                            <td>
                                                <a> {sources._source.title}</a> <br />

                                                {sources._source.content} <br />

                                                <p>출판사 : {sources._source.published_by} 출판일 : {sources._source.published_year_month} 카테고리 : {sources._source.category}  </p>

                                            </td>
                                        </tr>

                                    )
                                }) : ''
                        }


                    </table>
                </div>

                {
                    Count != 0 ?
                        <div className="filter">
                            <hr />
                            <div>
                                결과정렬 <br />
                                <Radio.Group value={sort} onChange={handleSort}>
                                    <Radio.Button value="default">정확도</Radio.Button>
                                    <Radio.Button value="latest">최신순</Radio.Button>
                                </Radio.Group>

                            </div>
                            <hr />
                            <div>
                                기간 <br />
                                <Radio.Group value={date} onChange={handleRangeDate}>
                                    <Radio.Button value="all">전체</Radio.Button>
                                    <Radio.Button value="now-1d/d">1일</Radio.Button>
                                    <Radio.Button value="now-7d/d">1주</Radio.Button> <br />
                                    <Radio.Button value="now-1M/d">1개월</Radio.Button>
                                    <Radio.Button value="now-1y/d">1년</Radio.Button>
                                </Radio.Group>
                                <br /><br />
                                {/* rangepicker */}
                                <Row gutter={5}>
                                    <Col span={16}>
                                        {/* <RangePicker onChange={onChangeDate}  /> */}
                                        <DatePicker onChange={handleGteDate} /> ~
                                        <DatePicker onChange={handleLteDate} />
                                    </Col>
                                    <Col span={8}>
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
                                                <Input ref={gtePrice} />
                                            </Col>
                                             ~
                                            <Col span={8}>
                                                <Input ref={ltePrice} />
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
                                <Radio.Group value={field} onChange={handleRangeField}>
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
            </Modal>
        </div>
    )
}


function index() {

    return (
        <Testdiv />
    )
}


export default index
