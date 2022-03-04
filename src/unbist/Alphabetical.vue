<script>
import { Config } from './config.js'
import chinesecharacter from 'chinese-character'
const config = new Config()
const skos = "http://www.w3.org/2004/02/skos/core#"

export default {
    props: ['uri'],
    data() {
        return {
            concepts: [],
            language: "en"
        }
    },
    computed: {
        sortedConcepts: function () {
            if (this.language == "zh") {
                // We can use a special sort function for Chinese here
                // I'm not sure about this function; it returns something different from 
                // what we had before, but its advantage is that it sorts in real time.
                return chinesecharacter.firstSort(this.concepts, 'label')
            } else {
                return this.concepts.sort((a,b) => { return a.label.localeCompare(b.label, this.language)})
            }
        }
    },
    created: async function () {
        if (this.$route.query.lang) {
            this.language = this.$route.query.lang
        }
        await this.getConcepts()
    },
    methods: {
        async getConcepts() {        
            const query = encodeURIComponent(`PREFIX skos: <${skos}> select * where { ?s rdf:type skos:Concept ; skos:prefLabel ?o . FILTER (langMatches(lang(?o), "${this.language}"))}`)

            fetch(`${config.sparqlEndpoint}?query=${query}`, {headers: config.headers}).then(r => r.json())
            .then(jsondata => {
                for (let result of jsondata.results.bindings) {
                    let identifier = result.s.value.split("/").pop()
                    if (identifier.length > 6) {
                        this.concepts.push({"uri": result.s.value, "label": result.o.value})
                    }
                }
            })
            document.title += " | Alphabetical"
            return true
        }
    }
}
</script>
<template>
    <div class="row">
        <div class="col-12">
            <div class="row my-2" v-for="c in sortedConcepts" :key="c.uri">
                <div class="col"><a :href="c.uri">{{c.label}}</a></div>
            </div>
        </div>
    </div>
</template>