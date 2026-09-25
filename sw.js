const CACHE_NAME = "deadline-buddy-v1";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./manifest.json",
    "./icon.svg"
];


/* INSTALL */

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


/* ACTIVATE */

self.addEventListener(
    "activate",
    event => {

        event.waitUntil(

            caches.keys()
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


/* FETCH */

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


/* PUSH NOTIFICATION */

self.addEventListener(
    "push",
    event => {

        let data = {

            title:
                "Deadline Buddy 🔔",

            message:
                "You have a new reminder."

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

            self.registration.showNotification(
                data.title,
                {

                    body:
                        data.message,

                    icon:
                        "./icon.svg",

                    badge:
                        "./icon.svg",

                    vibrate:
                        [
                            200,
                            100,
                            200
                        ],

                    tag:
                        "deadline-buddy-reminder",

                    renotify:
                        true

                }
            )

        );

    }
);


/* NOTIFICATION CLICK */

self.addEventListener(
    "notificationclick",
    event => {

        event.notification.close();


        event.waitUntil(

            clients.matchAll(
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
                            client.url.includes(
                                "index.html"
                            ) &&
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
