const activty = require('./actApi');
const club = require('./clubApi');
const manage = require('./manageApi');
const origanize = require('./organizeApi');
const user = require('./userApi');
const mine = require('./mineApi');
const system = require('./systemApi');

class Api {
    constructor(obj) {
        Object.assgin(this,{obj})
    }
    static factory(type) {
        switch (type) {
            case 'actApi':
                if (!Api.actApi) {
                    Api.actApi = new activty();
                }
                return Api.actApi;
            case 'clubApi':
                if (!Api.clubApi) {
                    Api.clubApi = new club();
                }
                return Api.clubApi;
            case 'manageApi':

                if (!Api.manageApi) {
                    Api.manageApi = new manage();
                }
                return Api.manageApi;
            case 'mineApi':
                if (!Api.mineApi) {
                    Api.mineApi = new mine();
                }
                return Api.mineApi;
            case 'organizeApi':
                if (!Api.organizeApi) {
                    Api.organizeApi = new origanize();
                }
                return Api.organizeApi;
            case 'userApi':
                if (!Api.userApi) {
                    Api.userApi = new user();
                }
                return Api.userApi;
            case 'systemApi':
                if (!Api.systemApi) {
                    Api.systemApi = new system();
                }
                return Api.systemApi;
        }

    }
}
module.exports = Api