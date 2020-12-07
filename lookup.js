const dns = require("dns")
const express = require('express');
const app = express();
const port = 8080;


console.log("Just looking up private networking");

async function getRegions(appname) {
    try {
        records = await dns.promises.resolveTxt(`regions.${appname}.internal`)
    } catch (error) {
        console.log(error);
        return { "error": error }
    }

    regionset = records[0][0]
    if (regionset == "") return [];

    return regionset.split(",");
};

async function getAllInstances(appname) {
    try {
        records = await dns.promises.resolve6(`global.${appname}.internal`)
    } catch (error) {
        console.log(error);
        return { "error": error }
    }
    return records;
};

async function getRegionInstances(region, appname) {
    try {
        options={ all: true }
        records = await dns.promises.lookup(`${region}.${appname}.internal`,options)
    } catch (error) {
        console.log(error);
        return { "error": error }
    }
    return records;
};

app.get('/', async function (req, res) {
    allregions = await getRegions("privatenet");
    regions = [];
    for (r of allregions) {
        regions.push(await getRegionInstances(r, "privatenet"));
    }
    global = await getAllInstances("privatenet");
    res.json({ "allregions": allregions, "regions": regions, "global": global });
})

app.listen(port, () => {
    console.log(`6PN Private Net Helper app listening at http://localhost:${port}`)
})
