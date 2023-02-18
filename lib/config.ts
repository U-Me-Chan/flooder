export const config = {
  crawlersMap: {
    'lib.ru': true,
    'fs': true,
    'panorama': true,
    'umechan': true,
  } as Record<string, boolean>,

  crawler: {
    fs: {
      corpusPath: 'corpus/',
      corpusReservPath: 'corpus-reserv/',
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
    }
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
