const CACHE_NAME =
    "deadline-buddy-final-v1";


const FILES_TO_CACHE = [

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
                            FILES_TO_CACHE
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


        if (
            event.request.method !==
            "GET"
        ) {

            return;

        }


        /*
         * HTML navigation:
         * network first,
         * cache fallback.
         */

        if (
            event.request.mode ===
            "navigate"
        ) {

            event.respondWith(

                fetch(
                    event.request
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
                                        event.request,
                                        copy
                                    )
                            );


                        return response;

                    }
                )

                .catch(
                    () =>
                        caches.match(
                            event.request
                        )
                )

            );


            return;

        }


        /*
         * Other files:
         * cache first.
         */

        event.respondWith(

            caches
                .match(
                    event.request
                )

                .then(
                    cached => {

                        if (
                            cached
                        ) {

                            return cached;

                        }


                        return fetch(
                            event.request
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
                "You have a new deadline reminder.",

            tag:
                "deadline-buddy-reminder"

        };


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
                            data.tag,

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
