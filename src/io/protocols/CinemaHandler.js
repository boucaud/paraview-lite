/* eslint-disable arrow-body-style */
export default function createMethods(session) {
  return {
    loadCdb: (cdbPath) => {
      return session.call('pv.cinema.load.database', [cdbPath]);
    },
    loadIndex: (index = 1) => {
      return session.call('pv.cinema.load.file', [index]);
    },
    getCurrentInfo: () => {
      return session.call('pv.cinema.current', []);
    },
    getDataBaseSize: () => {
      return session.call('pv.cinema.databasesize', []);
    },
  };
}
