<script>
import { Config } from './config.js'
const config = new Config()
const skos = "http://www.w3.org/2004/02/skos/core#"
const rdf = "http://www.w3.org/1999/02/22-rdf-syntax-ns#"

export default {
    props: ['uri'],
    data() {
        return {
            concept: {
                'uri': this.uri,
                'properties': [],
                'myPrefLabel': '',
                'prefLabels': [],
                'conceptSchemes': []
            },
            language: "en",
            relTypes: [
                {'name': 'Concept Schemes', 'accessor': 'conceptSchemes'},
            ]
        }
    },
    computed: {
        sortedIdentifiers: function () {
            return this.concept.conceptSchemes.sort((a,b) => { return a.identifier.localeCompare(b.identifier) })
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
            const query = encodeURIComponent(`PREFIX skos: <${skos}> select * where { <${this.concept.uri + "00"}> ?p ?o }`)

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
                }
            })

            const conceptSchemesQ = encodeURIComponent(`PREFIX skos: <${skos}> PREFIX rdf: <${rdf}> select * where { ?s rdf:type skos:ConceptScheme }`)
            fetch(`${config.sparqlEndpoint}?query=${conceptSchemesQ}`, {headers: config.headers}).then(r => r.json())
            .then(jsondata => {
                for (let result of jsondata.results.bindings) {
                    console.log(result)
                    const relQ = encodeURIComponent(`PREFIX skos: <${skos}> select * where { <${result.s.value}> <${skos}prefLabel> ?o . FILTER (langMatches(lang(?o),"${this.language}"))}`)
                    fetch(`${config.sparqlEndpoint}?query=${relQ}`, {headers: config.headers}).then(r => r.json())
                    .then(jsondata => {
                        let identifier = result.s.value.split('/').pop()
                        if (identifier !== "00") {
                            this.concept["conceptSchemes"].push({'uri': result.s.value, 'identifier': identifier, 'label': jsondata.results.bindings[0].o.value})
                        }
                    })
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
                <div class="col-3"><span>{{ $t("message.preferredTerm") }}</span></div>
                <div class="col-9">
                    <h4>{{concept.myPrefLabel}}</h4>
                </div>
            </div>

            <div class="row my-2" v-for="rt in relTypes" :key="rt.accessor">
                <div class="col-3"><span>{{ $t(`message.${rt.accessor}`) }}</span></div>
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
                        <div class="col"><span>{{concept.uri.slice(0, -1)}}</span></div>
                    </div>
                </div>
            </div>
            <div class="row my-2">
                <div class="col-3"><span>{{ $t("message.otherFormats") }}</span></div>
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
                <div class="col"><span>{{ $t("message.languageEquivalents") }}</span></div>
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