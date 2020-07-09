import { mapGetters, mapActions } from 'vuex';

import module from './module';

// ----------------------------------------------------------------------------
// Component
// ----------------------------------------------------------------------------

export default {
  name: 'CinemaReader',
  data() {
    return {
      currentFileName: '',
      currentIndex: -1,
      numberOfFiles: 0,
      module,
      color: 'grey darken-2',
      isLoading: false,
    };
  },
  computed: mapGetters({
    client: 'PVL_NETWORK_CLIENT',
  }),
  watch: {
    currentIndex() {
      if (this.isValidIndex(this.currentIndex)) {
        this.loadCurrent();
      }
    },
  },
  methods: Object.assign(
    {
      loadCurrent() {
        if (this.isLoading) {
          // Avoid spamming
          return;
        }
        this.isLoading = true;
        this.client.remote.CinemaHandler.loadIndex(this.currentIndex).then(
          () => {
            this.syncCurrentInfo();
            this.isLoading = false;
          }
        );
      },
      syncCurrentInfo() {
        this.client.remote.CinemaHandler.getCurrentInfo().then(({ name }) => {
          this.currentFileName = name;
        });
      },
      isValidIndex(index) {
        return (
          typeof index === 'number' && index > 0 && index <= this.numberOfFiles
        );
      },
      setIndexFromString(stringIndex) {
        const intIndex = parseInt(stringIndex);
        if (this.isValidIndex(intIndex)) {
          this.currentIndex = intIndex;
        }
      },
      incrementIndex(direction = 1) {
        const newIndex = this.currentIndex + direction;
        if (this.isValidIndex(newIndex)) {
          this.currentIndex += direction;
        }
      },
    },
    mapActions({ removeActiveModule: 'PVL_MODULES_ACTIVE_CLEAR' })
  ),
  mounted() {
    this.client.remote.CinemaHandler.getDataBaseSize().then(({ size }) => {
      this.numberOfFiles = size;
      if (size > 0) {
        this.currentIndex = 1;
      }
    });
  },
};
