'use strict';

const express = require('express');
const app = express();
const port = 5000;

const { Client } = require('elasticsearch');
const bodyParser = require('body-parser');
const client = new Client({ node: 'http://localhost:9200' });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.get('/', (req, res) => {
    res.send('<h1>검색엔진 구축</h1>');
})

app.post('/api/search', (req, res) => {

    let querySet = {
        index: 'yes24_index_01',
        size: 182,
        body: {
            query: {
                bool: {
                }
            },

        }
    };

    let must = [];

    if (req.body.field && req.body.field !== 'all') {
        must.push(
            {
                "query_string": {
                    "fields": [req.body.field+'.kobrick'],
                    "query": req.body.query
                }
            }

        )
    } else {
        must.push({

            "query_string": {
                "fields": [
                    "title^100", "title.kobrick^100",
                    "category", "category.kobrick",
                    "published_by", "published_by.kobrick",
                    "content^50", "content.kobrick^50"],
                "query": req.body.query
            }

        })
    }

    if (req.body.sort === 'sort') {
        querySet.body.sort =
            [
                {
                    "pub_year_month": {
                        "order": "desc"
                    }
                }
            ]
    }

    if (req.body.gteDate !== 'all') {
        let gte = req.body.gteDate.substring(0, 10);
        let lte = "now";

        if (req.body.lteDate) {
            gte = req.body.gteDate.substring(0, 10);
            lte = req.body.lteDate.substring(0, 10);
        }

        must.push(
            {
                "range": {
                    "pub_year_month": {
                        "gte": gte,
                        "lte": lte
                    }
                }
            }
        )
    }

    if (req.body.gtePrice && req.body.ltePrice) {
        must.push(
            {
                "range": {
                    "price": {
                        "gte": parseInt(req.body.gtePrice, 10),
                        "lte": parseInt(req.body.ltePrice, 10)
                    }
                }
            }
        )
    }

    if (req.body.match) {
        const queries = (req.body.match + '').split(',');

        let mustquery = {
            "bool": {
                "must": []
            }
        }

        let trimData;
        queries.map((data) => {
            trimData = data.replace(/^\s+|\s+$/gm,'');
            mustquery.bool.must.push(
                {
                    "bool": {
                        "should": [
                            {
                                "term": {
                                    "title.kobrick": trimData
                                }
                            },
                            {
                                "term": {
                                    "content.kobrick": trimData
                                }
                            },
                            {
                                "term": {
                                    "category.kobrick": trimData
                                }
                            },
                            {
                                "term": {
                                    "published_by.kobrick": trimData
                                }
                            }
                        ]
                    }
                }
            )

        })

        must.push(mustquery);
    }

    if (req.body.must) {

        const queries = (req.body.must + '').split(',');

        let mustquery = {
            "bool": {
                "must": []
            }
        }

        queries.map((data) => {
            data = data.replace(/^\s+|\s+$/gm,'');
            mustquery.bool.must.push(
                {
                    "query_string": {
                        "fields": [
                            "title^100", "title.kobrick^100",
                            "category", "category.kobrick",
                            "published_by", "published_by.kobrick",
                            "content^50", "content.kobrick^50"],
                        "query": data
                    }
                }
            )

        })

        must.push(mustquery);
    }
    if (req.body.mustNot) {
        const queries = (req.body.mustNot + '').split(',');

        let mustnotquery = {
            "bool": {
                "must_not": []
            }
        }

        queries.map((data) => {
            // 공백제거 정규식
            // /(^\s*)|(\s*$)/gi

            data = data.replace(/^\s+|\s+$/gm,'');
            mustnotquery.bool.must_not.push(
                {
                    "query_string": {
                        "fields": [
                            "title^100", "title.kobrick^100",
                            "category", "category.kobrick",
                            "published_by", "published_by.kobrick",
                            "content^50", "content.kobrick^50"],
                        "query": data
                    }
                }
            )

        })

        must.push(mustnotquery);
    }

    querySet.body.highlight = {
        "fields": [
            {
                "content.kobrick": {
                    "pre_tags": "<span>",
                    "post_tags": "</span>"
                }
            },
            {
                "category.kobrick": {
                    "pre_tags": "<span className='highlight'>",
                    "post_tags": "</span>"
                }
            },
            {
                "title.kobrick": {
                    "pre_tags": "<span className='highlight'>",
                    "post_tags": "</span>"
                }
            },
            {
                "published_by.kobrick": {
                    "pre_tags": "<span className='highlight'>",
                    "post_tags": "</span>"
                }
            }
        ]
    }
    querySet.body.query.bool.must = must;
    // console.log(JSON.stringify(querySet));

    let search = client.search(querySet);
    search.then((message) => {
        res.send(message.hits.hits);

    })
        .catch((error) => {
            console.log(error);
        })

})



app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
})

client.ping({
    requestTimeout: 1000
}, function (error) {
    if (error) {
        console.trace('elasticsearch cluster is down!');
    } else {
        console.log('All is well');
    }
})






