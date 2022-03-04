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
                'narrowerTerms': [],
            },
            language: "en",
            relTypes: [
                {'name': 'Narrower Terms', 'accessor': 'narrowerTerms', 'predicate': `${skos}narrower`},
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
        .then(await this.buildHierarchy())
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

                    for (let p of ['altLabel', 'scopeNote', 'note']) {
                        if (result.p.value == `${skos}${p}`) {
                            this.concept[`${p}s`].push({'value': result.o.value, 'lang': result.o['xml:lang']})
                        }
                    }

                    for (let p of this.relTypes) {
                        if (result.p.value == p.predicate) {
                            const relQ = encodeURIComponent(`PREFIX skos: <${skos}> select * where { <${result.o.value}> <${skos}prefLabel> ?o . FILTER (langMatches(lang(?o),"${this.language}"))}`)
                            fetch(`${config.sparqlEndpoint}?query=${relQ}`, {headers: config.headers}).then(r => r.json())
                            .then(jsondata => {
                                this.concept[p.accessor].push({'uri': result.o.value, 'label': jsondata.results.bindings[0].o.value})
                            })
                        }
                    }
                }
            })
            return true
        },
        async buildHierarchy() {
            for (let b of this.concept.broaderTerms) {
                console.log(b)
            }
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
            <div class="row my-2">
                <div class="col-3"><span>{{ $t("message.hierarchy") }}</span></div>
                <div class="col-9">
                    <h4>...</h4>
                </div>
            </div>

            <!-- About as DRY as can be but doesn't come sorted, so ordering is pretty random -->
            <div class="row my-2" v-for="rt in relTypes" :key="rt.accessor">
                <div class="col-3"><span>{{ $t(`message.${rt.accessor}`) }}</span></div>
                <div class="col-9">
                    <div class="row" v-for="r in this.concept[rt.accessor].sort((a,b) => {return a.label.localeCompare(b.label, this.language)})" :key="r.uri">
                        <div class="col"><a :href="r.uri">{{r.label}}</a></div>
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
                    <div v-for="label of concept.prefLabels" v-bind:key="label.lang" class="row">
                        <div class="col-1">{{label.lang}}</div>
                        <div class="col-11">{{label.value}}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>