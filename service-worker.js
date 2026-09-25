const CACHE_NAME = "deadline-buddy-v1";


const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./manifest.json",
    "./icon.svg"
];


self.addEventListener(
    "install",
    event => {

        event.waitUntil(

            caches.open(
                CACHE_NAME
            )

            .then(
                cache =>
                    cache.addAll(
                        FILES_TO_CACHE
                    )
            )

        );


        self.skipWaiting();

    }
);


self.addEventListener(
    "activate",
    event => {

        event.waitUntil(

            caches.keys()
            .then(
                cacheNames =>
                    Promise.all(

                        cacheNames

                        .filter(
                            name =>
                                name !==
                                CACHE_NAME
                        )

                        .map(
                            name =>
                                caches.delete(
                                    name
                                )
                        )

                    )
            )

        );


        self.clients.claim();

    }
);


self.addEventListener(
    "fetch",
    event => {

        event.respondWith(

            caches.match(
                event.request
            )

            .then(
                cachedResponse => {

                    if (
                        cachedResponse
                    ) {

                        return cachedResponse;

                    }


                    return fetch(
                        event.request
                    );

                }
            )

        );

    }
);
