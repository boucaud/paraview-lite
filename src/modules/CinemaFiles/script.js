import { mapGetters, mapActions } from 'vuex';

import module from './module';

// ----------------------------------------------------------------------------
// Component
// ----------------------------------------------------------------------------

function isCinemaDirectory(dirName) {
  const ext = dirName.split('.').pop();
  return ext === 'cdb';
}

export default {
  name: 'CinemaFiles',
  data() {
    return {
      label: 'Home',
      directories: [],
      groups: [],
      cdbDirectories: [],
      files: [],
      path: [],
      module,
      color: 'grey darken-2',
    };
  },
  computed: mapGetters({
    client: 'PVL_NETWORK_CLIENT',
    modules: 'PVL_MODULES_MAP',
  }),
  methods: Object.assign(
    {
      listServerDirectory(pathToList) {
        this.client.remote.FileListing.listServerDirectory(pathToList)
          .then((listing) => {
            const { dirs, files, groups, path } = listing;
            this.files = files;
            this.groups = groups;
            this.directories = dirs.filter((name) => !isCinemaDirectory(name));
            this.cdbDirectories = dirs.filter((name) =>
              isCinemaDirectory(name)
            );
            this.path = path;
            this.label = this.path.slice(-1)[0];
          })
          .catch(console.error);
      },
      openFiles(files) {
        const pathPrefix = this.path.slice(1).join('/');
        const relativePathFiles =
          this.path.length > 1 ? files.map((f) => `${pathPrefix}/${f}`) : files;
        this.client.remote.ProxyManager.open(relativePathFiles)
          .then((readerProxy) => {
            this.$store.dispatch('PVL_PROXY_NAME_FETCH', readerProxy.id);
            this.$store.dispatch('PVL_PROXY_PIPELINE_FETCH');
            this.$store.dispatch('PVL_MODULES_ACTIVE_CLEAR');
            this.$store.commit('PVL_PROXY_SELECTED_IDS_SET', [readerProxy.id]);
          })
          .catch(console.error);
      },
      openCdbDirectory(directoryName) {
        this.client.remote.CinemaHandler.loadCdb(directoryName).then(() => {
          this.removeActiveModule();
          this.$store.dispatch('PVL_MODULES_ACTIVE_BY_NAME', 'CinemaReader');
        });
      },
      openDirectory(directoryName) {
        if (isCinemaDirectory(directoryName)) {
          this.openCdbDirectory(directoryName);
        } else {
          this.listServerDirectory(this.path.concat(directoryName).join('/'));
        }
      },
      listParentDirectory(index) {
        if (index) {
          this.listServerDirectory(this.path.slice(0, index + 1).join('/'));
        } else {
          this.listServerDirectory('.');
        }
      },
    },
    mapActions({ removeActiveModule: 'PVL_MODULES_ACTIVE_CLEAR' })
  ),
  mounted() {
    this.listServerDirectory('.');
  },
};
