import { mapGetters, mapActions } from 'vuex';

import module from './module';

// ----------------------------------------------------------------------------
// Component
// ----------------------------------------------------------------------------

export default {
  name: 'LiveVisualization',
  data() {
    return {
      isConnected: false,
      shouldMonitor: false,
      remoteSources: [],

      label: 'Connect',

      host: 'localhost',
      port: '22222',
      module,
      color: 'grey darken-2',
    };
  },
  computed: mapGetters({
    client: 'PVL_NETWORK_CLIENT',
  }),
  methods: Object.assign(
    {
      extract(source) {
        if (source) {
          let subscription = null;
          this.client.remote.LiveVisualizationHandler.onUpdate(() => {
            this.client.remote.LiveVisualizationHandler.show(source).then(
              () => {
                this.client.remote.ViewPort.resetCamera();
                this.$store.dispatch('PVL_VIEW_RENDER');
              }
            );
            this.client.remote.LiveVisualizationHandler.offUpdate(subscription);
            this.client.remote.LiveVisualizationHandler.onUpdate(() => {
              this.$store.dispatch('PVL_VIEW_RENDER');
            });
            this.removeActiveModule();
          }).then((result) => {
            subscription = result;
          });
          this.client.remote.LiveVisualizationHandler.extract(source);
        }
      },
      monitor() {
        this.client.remote.LiveVisualizationHandler.monitor().then(() => {
          // TODO: timeout if not connected in X seconds ?
          if (this.shouldMonitor) {
            setTimeout(() => {
              this.monitor();
            }, 1000);
          }
        });
      },
      update() {
        console.log('updated: ', this.host, this.port);
      },
      connect() {
        this.client.remote.LiveVisualizationHandler.onConnected(() => {
          this.isConnected = true;
          this.client.remote.LiveVisualizationHandler.list().then(
            ({ list }) => {
              this.remoteSources = list;
            }
          );
        });

        this.client.remote.LiveVisualizationHandler.onDisconnected(() => {
          this.shouldMonitor = false;
          this.isConnected = false;
          this.remoteSources = [];
        });

        this.client.remote.LiveVisualizationHandler.connect(
          this.host,
          parseInt(this.port)
        )
          .then(() => {
            this.shouldMonitor = true;
            this.monitor();
          })
          .catch((error) => {
            console.error('Failed to connect', error);
          });
      },
    },
    mapActions({ removeActiveModule: 'PVL_MODULES_ACTIVE_CLEAR' })
  ),
};
