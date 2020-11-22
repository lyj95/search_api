'use strict';

const express = require('express');
const app = express();
const port = 5000;

const { Client } = require('elasticsearch');
const bodyParser = require('body-parser');
const { json } = require('body-parser');
const client = new Client({ node: 'http://localhost:9200' });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.get('/', (req, res) => {
    res.send('<h1>검색엔진 구축</h1>');
})

app.post('/api/search', (req, res) => {

    let querySet = {
        index: 'yes24_index_01',
        body: {
            query: {
                bool: {
                }
            }
        }
    };

    let must = [];
    let should = [];
    let must_not = [];

    if (req.body.field !== 'all') {
        must.push(
            {
                "query_string": {
                    "fields": [req.body.field],
                    "query": req.body.query
                }
            }

        )
    } else {
        must.push({

            "query_string": {
                "fields": ["title.kobrick",
                    "category.kobrick",
                    "published_by.kobrick",
                    "content.kobrick"],
                "query": req.body.query
            }

        })
    }

    if (req.body.sort) {
        querySet.body.sort =
            [
                {
                    "pub_year_month": {
                        "order": "desc"
                    }
                }
            ]
    }

    let lte = "now";
    if (req.body.gteDate) {
        if (req.body.lte) {
            lte = req.body.lteDate;
        }

        must.push(
            {
                "range": {
                    "pub_year_month": {
                        "gte": req.body.gteDate,
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
                        "gte": parseInt(req.body.gtePrice),
                        "lte": parseInt(req.body.ltePrice)
                    }
                }
            }
        )
    }

    // if(req.body.match){
    //     {

    //         "query_string": {
    //             "fields": ["title.kobrick",
    //                 "category.kobrick",
    //                 "published_by.kobrick",
    //                 "content.kobrick"],
    //             "query": req.body.match
    //         }

    //     }
    // }
    // if(req.body.must){
    //     {

    //         "query_string": {
    //             "fields": ["title.kobrick",
    //                 "category.kobrick",
    //                 "published_by.kobrick",
    //                 "content.kobrick"],
    //             "query": req.body.must
    //         }

    //     }
    // }
    // if(req.body.mustNot){
    //     {

    //         "query_string": {
    //             "fields": ["title.kobrick",
    //                 "category.kobrick",
    //                 "published_by.kobrick",
    //                 "content.kobrick"],
    //             "query": req.body.mustNot
    //         }

    //     }
    // }

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



app.post('/search/detail', (req, res) => {
    if (req.body.must != null) {
        querySet.body.query.bool = {
            "must": [
                {
                    "query_string": {
                        "fields": ["title.kobrick", "category.kobrick", "published_by.kobrick", "content.kobrick"],
                        "query": req.body.must
                    }
                }
            ]
        }
    }
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






