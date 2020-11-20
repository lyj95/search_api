import React from 'react'
import { useState, useRef, useEffect } from 'react';
import { Radio, DatePicker, Input, Col, Row, Button } from 'antd';
import 'antd/dist/antd.css';
import DetailModal from '../../component/modal/detailModal';


import axios from "axios";
import "./index.css";
import Modal from 'antd/lib/modal/Modal';




const Testdiv = (props) => {
    const searchText = useRef(false);
    // const [Text, setText] = useState("");
    const [Result, setResult] = useState("");
    const [Count, setCount] = useState("");

    let params = { query: searchText.current.value, field: 'all', sort: '', gteDate: '', lteDate: '', gtePrice: '', ltePrice: '' };

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

                if(hits.length == 0){
                    setFilter("해당 필터 조건에 대한 결과가 없습니다.");    
                    setResult('');
                    setCount('');
                }else{
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




    return (
        <div className="body">

            <input className="searchInput" placeholder={"검색어를 입력하세요."} ref={searchText} onKeyPress={appKeyPress} onChange={() => onSearch()} />
            <button className='searchButton' onClick={() => onSearch()} >검색</button>
            <Button shape="circle" onClick={() => openModal("null")}>
                v
            </Button>
            <hr />
            {
                Filter ?
                    '' : <div>'{searchText.current.value}' 에 대한 검색 결과는 {Count}건 입니다.</div>
            }

            <br />
            <div className="container">
                <div className="result" >
                { Filter }
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
                                <Row gutter={5}>
                                    <Col span={16}>
                                        <RangePicker />
                                    </Col>
                                    <Col span={8}>
                                        <Button>적용</Button>
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
                                                <Input  ref={gtePrice} />
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
            <DetailModal>

            </DetailModal>
        </div>
    )
}


function index() {

    return (
        <Testdiv />
    )
}


export default index
