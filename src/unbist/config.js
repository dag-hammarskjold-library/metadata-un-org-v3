export class Config {
    constructor() {
        this.sparqlEndpoint = 'http://localhost:7200/repositories/UNBIST_core';
        this.headers = {
            'Accept': 'application/json'
        }
        this.langMap = {
            "ar": {"sortCode": "A"},
            "zh": {"sortCode": "C"},
            "en": {"sortCode": "E"},
            "fr": {"sortCode": "F"},
            "ru": {"sortCode": "R"},
            "es": {"sortCode": "S"},
        }
    }
}