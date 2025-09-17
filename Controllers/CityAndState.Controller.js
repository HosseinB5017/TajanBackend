const City = require('../models/City.js');
const State = require('../models/State.js');


const createCity = async (req, res, next) => {
    try {
        const city = new City(req.body);
        await city.save();
        res.status(200).json(city);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const insertManyCities = async (req, res, next) => {
    try {
        var cityDocuments = [];
        for (const cityData of req.body) {
        const state = await State.findOne({ id: cityData.province_id }); // Find the corresponding state

        if (state) {
            const cityDocument = new City({
                name: {
                    fa: cityData.title,
                    en: cityData.slug // You can use slug as the English name
                },
                state: state._id, // Set the state reference to the state's _id
                location: {
                    lat: cityData.latitude,
                    lng: cityData.longitude
                }
            });

            cityDocuments.push(cityDocument);
        }
    }
        const result = await City.insertMany(cityDocuments);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getAllCities = async (req, res, next) => {
    try {
        var filter = {};
        if (req.query.stateId)
        {
            filter = {
                state : req.query.stateId
            }
        }
        console.log(filter);
        const result = await City.find(filter).populate("state");
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getCityById = async (req, res, next) => {
    try {
        const city = await City.findById(req.query.id).populate("state");
        if (!city) {
            return res.status(404).json({ error: 'City not found' });
        }
        res.status(200).json(city);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateCityById = async (req, res, next) => {
    try {
        const updatedCity = await City.findByIdAndUpdate(req.query.id, req.body, { new: true });
        if (!updatedCity) {
            return res.status(404).json({ error: 'City not found' });
        }
        res.status(200).json(updatedCity);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteCityById = async (req, res, next) => {
    try {
        const deletedCity = await City.findByIdAndRemove(req.params.id);
        if (!deletedCity) {
            return res.status(404).json({ error: 'City not found' });
        }
        res.status(200).json(deletedCity);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
///////////////////////////////////////// here is cities

const createState = async (req, res, next) => {
    try {
        const state = new State(req.body);
        await state.save();
        res.status(200).json(state);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const insertManyStates = async (req, res, next) => {
    const statesToInsert = req.body;
    try {
        const ardabilCities = statesToInsert.map(state => ({
            name: {
                fa: state.title,
                en: state.slug
            },
            location : {
                lat : state.latitude,
                lng : state.longitude
            },
            id : state.id
        }));

        const result = await State.insertMany(ardabilCities);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getAllStates = async (req, res, next) => {
    try {
        const result = await State.find();
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getStateById = async (req, res, next) => {
    try {
        const state = await State.findById(req.query.id);
        if (!state) {
            return res.status(404).json({ error: 'state not found' });
        }
        res.status(200).json(state);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateStateById = async (req, res, next) => {
    try {
        const updatedState = await State.findByIdAndUpdate(req.query.id, req.body, { new: true });
        if (!updatedState) {
            return res.status(404).json({ error: 'State not found' });
        }
        res.status(200).json(updatedState);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteStateById = async (req, res, next) => {
    try {
        const deletedState = await State.findByIdAndRemove(req.params.id);
        if (!deletedState) {
            return res.status(404).json({ error: 'State not found' });
        }
        res.status(200).json(deletedState);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/*
const UpdateCitess = async (req, res, next) => {
    try {
        const states = await City.find();
       /!* deletedState.forEach(item => {
            const index = nc.findIndex(city=>(city.title === item.name.fa))
            if (index !==-1){
                const provinceID = nc[index].province_id;
                const foundProvince = np.find(province => province.id === provinceID);
                if (foundProvince)
                {
                    const provinceName = foundProvince.title;
                    const state = await State.find({'name.$.fa' :provinceName})
                }
            }
        });*!/


        await Promise.all(states.map(async (item) => {
            const index = nc.findIndex(city => city.title === item.name.fa);
            const _item = item;
            if (index !== -1) {
                const provinceID = nc[index].province_id;
                const foundProvince = np.find(province => province.id == provinceID);
                console.log("provinceID"+provinceID + "   ******   "+ foundProvince.id);

                if (foundProvince) {
                    const provinceName = foundProvince.title;
                    const state = await State.findOne({ 'name.fa': provinceName });
                    if (state) {
                        console.log("update " + _item.name.fa + " :: " + state.name.fa)
                        const updatedCity = await City.findByIdAndUpdate(
                            _item._id,
                            {state: state._id},
                            {new: false}
                        );
                        //console.log("updated !")
                    }
                    else
                        console.log(provinceName + "can not find state" )
                }
                else
                    console.log(provinceID + "can not find province with id")

            }
            else
                console.log(item.name.fa + "can not find city title")
        }));

        res.status(200).json("done!");


    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
*/

module.exports = {createCity  , updateCityById , deleteCityById , getCityById , insertManyCities, getAllCities , createState , updateStateById , deleteStateById , getStateById , getAllStates ,insertManyStates}