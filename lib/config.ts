export const config = {
  crawlersMap: {
    'lib.ru': false,
    'fs': true,
    'panorama': false,
    'umechan': false,
  } as Record<string, boolean>,

  app: {
    listenPort: 3030,
  },

  crawler: {
    fs: {
      dirs: [
        'corpus/',
        'corpus-reserv/',
      ],
    },
    libru: {
      corpusReservPath: 'corpus-reserv/',
      cachedUrlsPath: 'storage/crawler_lib_ru_urls.json',
    },
    umechan: {
      corpusReservPath: 'corpus-reserv/',
      pageSize: 50,
      maxPageThreshold: 250,
      baseUrl: 'https://scheoble.xyz/api',
      getAllLink: `https://scheoble.xyz/api/v2/board/b+cu+l+m+mod+t+v+vg+fap`,
    },
    panorama: {
      corpusReservPath: 'corpus-reserv/',
    },
  },

  axios: {
    retryCount: 100,
  },

  storage: {
    fetchedPath: 'storage/fetched.json',
  },

  fetcher: {
    recallInterval: 60 * 1000,
    loadFetchedIntoCorpus: true,
  },

  corpus: {
    markovStrings: {
      stateSize: 2,
      generateMaxTries: 100000,
      generateMinRefCount: 5,
    },
    modelFilePath: 'storage/model.json',
  }
};
