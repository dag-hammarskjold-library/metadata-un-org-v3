import About from './About.vue'
import Concept from './Concept.vue'
import Domain from './Domain.vue'
import MicroThesaurus from './MicroThesaurus.vue'
import Thesaurus from './Thesaurus.vue'
import Alphabetical from './Alphabetical.vue'

const baseURI = 'http://metadata.un.org/thesaurus/'

function mapUri(route) {
    let myUri = `${baseURI}${route.params.concept}`
    //console.log(myUri)
    return {
        uri: myUri
    }
}

export let unbistRoutes = [
    { path: '/thesaurus', name: 'UNBIS Thesaurus', component: Thesaurus, props: {"uri": baseURI} },
    { path: '/thesaurus/:concept(\\d{2})', component: Domain, props: mapUri },
    { path: '/thesaurus/:concept(\\d{6})', component: MicroThesaurus, props: mapUri },
    { path: '/thesaurus/:concept', component: Concept, props: mapUri, },
    { path: '/thesaurus/about', name: 'About', component: About },
    //{ path: '/thesaurus/search', name: 'About', component: Search },
    //{ path: '/thesaurus/categories', name: 'About', component: Browse },
    { path: '/thesaurus/alphabetical', name: 'About', component: Alphabetical },
]