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
            }
        }
    };

    let must = [];

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

    if (req.body.gteDate) {
        let gte = req.body.gteDate;
        let lte = "now";

        if (req.body.lteDate) {
            gte = req.body.gteDate.substring(0,10);
            lte = req.body.lteDate.substring(0,10);
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

    if(req.body.match){
        const queries = (req.body.match+'').split(',');

        let mustquery = {
            "bool": {
                "must": []
              }
        }

        queries.map((data) => {
            mustquery.bool.must.push(
                {
                    "query_string": {
                        "fields": ["title.kobrick",
                            "category.kobrick",
                            "published_by.kobrick",
                            "content.kobrick"],
                        "query": data
                    }
                }
            )

        })

        must.push(mustquery);
    }
    
    if(req.body.must){

        const queries = (req.body.must+'').split(',');

        let mustquery = {
            "bool": {
                "must": []
              }
        }

        queries.map((data) => {
            mustquery.bool.must.push(
                {
                    "query_string": {
                        "fields": ["title.kobrick",
                            "category.kobrick",
                            "published_by.kobrick",
                            "content.kobrick"],
                        "query": data
                    }
                }
            )

        })

        must.push(mustquery);
    }
    if(req.body.mustNot){
        const queries = (req.body.mustNot+'').split(',');

        let mustnotquery = {
            "bool": {
                "must_not": []
              }
        }

        queries.map((data) => {
            mustnotquery.bool.must_not.push(
                {
                    "query_string": {
                        "fields": ["title.kobrick",
                            "category.kobrick",
                            "published_by.kobrick",
                            "content.kobrick"],
                        "query": data
                    }
                }
            )

        })

        must.push(mustnotquery);
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






