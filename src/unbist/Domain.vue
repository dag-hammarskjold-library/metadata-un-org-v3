<script>
import { Config } from './config.js'
const config = new Config()
const skos = "http://www.w3.org/2004/02/skos/core#"

export default {
    props: ['uri'],
    data() {
        return {
            concept: {
                'uri': this.uri,
                'properties': [],
                'myPrefLabel': '',
                'prefLabels': [],
                'hasTopConcept': []
            },
            language: "en",
            relTypes: [
                {'name': 'Top Concepts', 'accessor': 'hasTopConcept', 'predicate': `${skos}hasTopConcept`},
            ]
        }
    },
    computed: {
        sortedIdentifiers: function () {
            return this.concept.hasTopConcept.sort((a,b) => { return a.identifier.localeCompare(b.identifier) })
        },
        sortedLanguages: function() {
            return this.concept.prefLabels.sort((a,b) => { return config.langMap[a.lang].sortCode.localeCompare(config.langMap[b.lang].sortCode) })
        }
    },
    created: async function () {
        if (this.$route.query.lang) {
            this.language = this.$route.query.lang
        }
        await this.getConcept()
    },
    methods: {
        async getConcept() {
            const query = encodeURIComponent(`PREFIX skos: <${skos}> select * where { <${this.uri}> ?p ?o }`)

            fetch(`${config.sparqlEndpoint}?query=${query}`, {headers: config.headers}).then(r => r.json())
            .then(jsondata => {
                for (let result of jsondata.results.bindings) {
                    if (result.p.value == `${skos}prefLabel`) {
                        this.concept.prefLabels.push({'value': result.o.value, 'lang': result.o['xml:lang']})
                        if (result.o['xml:lang'] == this.language) {
                            this.concept.myPrefLabel = result.o.value
                            document.title += ` | ${this.concept.myPrefLabel}`
                        }
                    }

                    for (let p of this.relTypes) {
                        if (result.p.value == p.predicate) {
                            const relQ = encodeURIComponent(`PREFIX skos: <${skos}> select * where { <${result.o.value}> <${skos}prefLabel> ?o . FILTER (langMatches(lang(?o),"${this.language}"))}`)
                            fetch(`${config.sparqlEndpoint}?query=${relQ}`, {headers: config.headers}).then(r => r.json())
                            .then(jsondata => {
                                let identifier = result.o.value.split('/').pop().match(/.{1,2}/g).join(".")
                                this.concept[p.accessor].push({'uri': result.o.value, 'identifier': identifier, 'label': jsondata.results.bindings[0].o.value})
                            })
                        }
                    }
                }
            })
            return true
        }
    }
}
</script>

<template>
<div class="row">
        <div class="col-7">
            <div class="row my-2">
                <div class="col-3"><span>Preferred Term</span></div>
                <div class="col-9">
                    <h4>{{concept.myPrefLabel}}</h4>
                </div>
            </div>

            <div class="row my-2" v-for="rt in relTypes" :key="rt.accessor">
                <div class="col-3"><span>{{rt.name}}</span></div>
                <div class="col-9">
                    <div class="row" v-for="r in sortedIdentifiers" :key="r.uri">
                        <div class="col"><a :href="r.uri">{{r.identifier}} - {{r.label}}</a></div>
                    </div>
                </div>
            </div>

            <div class="row my-2">
                <div class="col-3"><span>URI</span></div>
                <div class="col-9">
                    <div class="row">
                        <div class="col"><span>{{concept.uri}}</span></div>
                    </div>
                </div>
            </div>
            <div class="row my-2">
                <div class="col-3"><span>Other Formats</span></div>
                <div class="col-9">
                    <div class="row">
                        <div class="col-2"><a href="#">json</a></div>
                        <div class="col-2"><a href="#">ttl</a></div>
                        <div class="col-2"><a href="#">xml</a></div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col">
            <div class="row my-2">
                <div class="col"><span>Language Equivalents</span></div>
            </div>
            <div class="row my-2">
                <div class="col">
                    <div v-for="label of sortedLanguages" v-bind:key="label.lang" class="row">
                        <div class="col-1">{{label.lang}}</div>
                        <div class="col-11">{{label.value}}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>