const CACHE_NAME =
    "deadline-buddy-v2";


const STATIC_FILES = [

    "./",

    "./index.html",

    "./manifest.json",

    "./icon.svg"

];


/* =========================================
   INSTALL
========================================= */

self.addEventListener(
    "install",
    event => {

        event.waitUntil(

            caches
                .open(
                    CACHE_NAME
                )
                .then(
                    cache =>
                        cache.addAll(
                            STATIC_FILES
                        )
                )

        );

        self.skipWaiting();

    }
);


/* =========================================
   ACTIVATE
========================================= */

self.addEventListener(
    "activate",
    event => {

        event.waitUntil(

            caches
                .keys()
                .then(
                    keys =>

                        Promise.all(

                            keys
                                .filter(
                                    key =>
                                        key !==
                                        CACHE_NAME
                                )
                                .map(
                                    key =>
                                        caches.delete(
                                            key
                                        )
                                )

                        )

                )

        );

        self.clients.claim();

    }
);


/* =========================================
   FETCH
========================================= */

self.addEventListener(
    "fetch",
    event => {

        /*
         * Only handle GET requests.
         */

        if (
            event.request.method !==
            "GET"
        ) {

            return;

        }


        const request =
            event.request;


        /*
         * HTML:
         * Network first, then cache.
         *
         * This allows GitHub Pages
         * to deliver updated versions.
         */

        if (
            request.mode ===
            "navigate"
        ) {

            event.respondWith(

                fetch(
                    request
                )

                .then(
                    response => {

                        const copy =
                            response.clone();


                        caches
                            .open(
                                CACHE_NAME
                            )
                            .then(
                                cache =>
                                    cache.put(
                                        request,
                                        copy
                                    )
                            );


                        return response;

                    }
                )

                .catch(
                    () =>
                        caches.match(
                            request
                        )
                )

            );


            return;

        }


        /*
         * Static files:
         * Cache first, network fallback.
         */

        event.respondWith(

            caches
                .match(
                    request
                )

                .then(
                    cached => {

                        if (
                            cached
                        ) {

                            return cached;

                        }


                        return fetch(
                            request
                        );

                    }
                )

        );

    }
);


/* =========================================
   PUSH NOTIFICATIONS
========================================= */

self.addEventListener(
    "push",
    event => {

        let data = {

            title:
                "Deadline Buddy 🔔",

            message:
                "You have a new deadline reminder."

        };


        /*
         * Read push data when available.
         */

        if (
            event.data
        ) {

            try {

                data =
                    event.data.json();

            }

            catch (
                error
            ) {

                data.message =
                    event.data.text();

            }

        }


        event.waitUntil(

            self.registration
                .showNotification(
                    data.title,

                    {

                        body:
                            data.message,

                        icon:
                            "./icon.svg",

                        badge:
                            "./icon.svg",

                        tag:
                            data.tag ||
                            "deadline-buddy-reminder",

                        renotify:
                            true,

                        data:
                            data

                    }
                )

        );

    }
);


/* =========================================
   NOTIFICATION CLICK
========================================= */

self.addEventListener(
    "notificationclick",
    event => {

        event.notification.close();


        event.waitUntil(

            clients
                .matchAll(
                    {
                        type:
                            "window",

                        includeUncontrolled:
                            true
                    }
                )

                .then(
                    clientList => {

                        for (
                            const client
                            of clientList
                        ) {

                            if (
                                "focus"
                                in client
                            ) {

                                return client.focus();

                            }

                        }


                        if (
                            clients.openWindow
                        ) {

                            return clients.openWindow(
                                "./"
                            );

                        }

                    }
                )

        );

    }
);
