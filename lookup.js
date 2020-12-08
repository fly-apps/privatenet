const dns = require("dns")
const express = require('express');
const expressapp = express();
const port = 8080;


console.log("Just looking up private networking");

async function getApps() {
    try {
        records = await dns.promises.resolveTxt(`privatenet.internal`)
    } catch (error) {
        console.log(error);
        return { "error": error }
    }

    appset = records[0][0]
    if (appset == "") return [];

    return appset.split(",");
};

async function getAppRegions(appname) {
    try {
        records = await dns.promises.resolveTxt(`regions.${appname}.internal`)
    } catch (error) {
        console.log(error);
        return { "error": error }
    }

    appset = records[0][0]
    if (appset == "") return [];

    return appset.split(",");
};


async function getRegionInstances(region, appname) {
    try {
        options={ all: true }
        records = await dns.promises.resolve6(`${region}.${appname}.internal`,options)
    } catch (error) {
        console.log(error);
        return { "error": error }
    }
    return records;
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

expressapp.get('/', async function (req, res) {
    results=[];
    apps=await getApps();
    results.push({allapps:apps});
    for (app of apps) {
        appregions = await getAppRegions(app);
        appinstances = await getAllInstances(app);
        regioninstances = [];
        for (region of appregions) {
          instances=await getRegionInstances(region, app)
          regioninstances.push({ [region]: instances });
        }
        results.push({ [app]: {"appregions":appregions,"appinstances":appinstances,"regioninstances":regioninstances}})
    }
    res.json(results);
})

expressapp.listen(port, () => {
    console.log(`6PN Private Net Helper app listening at http://localhost:${port}`)
})
