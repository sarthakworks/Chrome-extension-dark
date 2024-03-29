class Options {
    constructor() {
        (this.storage = STORAGE),
            this.colorPicker,
            this.initHandlers(),
            this.initStorage(),
            chrome.storage.onChanged.addListener(() => {
                chrome.storage.local.get(STORAGE, (a) => {
                    this.storage = a;
                });
            });
    }
    initHandlers() {
        const a = $(document.body);
        a.on("click", ".settings .mode .settings-block", (a) => {
            "INPUT" == a.target.nodeName ||
                "add-btn" == a.target.className ||
                ((this.storage.mode = a.currentTarget.dataset.mode),
                    this.setSettings(),
                    this.saveStorage());
        }),
            a.on(
                "click",
                ".settings .mode .settings-block[data-mode=except] .input-block .add-btn",
                () => {
                    $(
                        `.settings .mode .settings-block[data-mode=except] .tags`
                    ).tagEditor(
                        "addTag",
                        $(
                            ".settings .mode .settings-block[data-mode=except] .input-block input"
                        ).val()
                    ),
                        $(
                            ".settings .mode .settings-block[data-mode=except] .input-block input"
                        ).val("");
                }
            ),
            a.on(
                "click",
                ".settings .mode .settings-block[data-mode=onlyon] .input-block .add-btn",
                () => {
                    $(
                        `.settings .mode .settings-block[data-mode=onlyon] .tags`
                    ).tagEditor(
                        "addTag",
                        $(
                            ".settings .mode .settings-block[data-mode=onlyon] .input-block input"
                        ).val()
                    ),
                        $(
                            ".settings .mode .settings-block[data-mode=onlyon] .input-block input"
                        ).val("");
                }
            ),
            a.on("click", ".color .selected .add-btn", () => {
                if (9 > this.storage.colors.length)
                    this.storage.colors.push($("#selected_color").attr("data-color"));
                else {
                    if (this.storage.colors[0] == $("#selected_color").attr("data-color"))
                        return;
                    this.storage.colors.splice(
                        0,
                        0,
                        $("#selected_color").attr("data-color")
                    ),
                        this.storage.colors.splice(9, 1);
                }
                this.setSettings(), this.saveStorage();
            });
    }
    initStorage() {
        chrome.storage.local.get(this.storage, (a) => {
            (this.storage = a),
                this.setSettings(),
                $(`.settings .mode .settings-block[data-mode=except] .tags`).tagEditor({
                    initialTags: this.storage.exceptPages,
                    delimiter: ", ",
                    forceLowercase: !0,
                    placeholder: "Sites ...",
                    onChange: (a, b, c) => {
                        let d = [];
                        for (var e = 0; e < c.length; e++)
                            if (
                                (this.isValidDomain(c[e])
                                    ? d.push(c[e])
                                    : $(
                                        `.settings .mode .settings-block[data-mode=except] .tags`
                                    ).tagEditor("removeTag", c[e]),
                                    this.isValidURL(c[e]))
                            ) {
                                let a = c[e].split("/")[2];
                                $(
                                    `.settings .mode .settings-block[data-mode=except] .tags`
                                ).tagEditor("addTag", a),
                                    d.push(a);
                            }
                        (this.storage.exceptPages = d), this.saveStorage();
                    },
                }),
                $(`.settings .mode .settings-block[data-mode=onlyon] .tags`).tagEditor({
                    initialTags: this.storage.onlyOnPages,
                    delimiter: ", ",
                    forceLowercase: !0,
                    placeholder: "Sites ...",
                    onChange: (a, b, c) => {
                        let d = [];
                        for (var e = 0; e < c.length; e++)
                            if (
                                (this.isValidDomain(c[e])
                                    ? d.push(c[e])
                                    : $(
                                        `.settings .mode .settings-block[data-mode=onlyon] .tags`
                                    ).tagEditor("removeTag", c[e]),
                                    this.isValidURL(c[e]))
                            ) {
                                let a = c[e].split("/")[2];
                                $(
                                    `.settings .mode .settings-block[data-mode=onlyon] .tags`
                                ).tagEditor("addTag", a),
                                    d.push(a);
                            }
                        (this.storage.onlyOnPages = d), this.saveStorage();
                    },
                }),
                setTimeout(() => {
                    document.body.classList.add("load");
                }, 100);
        });
    }

    saveStorage() {
        chrome.storage.local.set(this.storage),
            chrome.runtime.sendMessage({ action: "storage_change" });
    }
    setSettings() {
        $(document.body);
        $(".settings .mode .settings-block").each((a, b) => {
            $(b).find(".checkbox").removeClass("checked");
        }),
            $(`.settings .mode .settings-block[data-mode=${this.storage.mode}]`)
                .find(".checkbox")
                .addClass("checked"),
            $(".favorites").html(""),
            this.storage.colors.forEach((a) => {
                $(".favorites").append(
                    $(
                        `<div class="item" data-color="${a}" style="background:${a};"></div>`
                    )
                );
            }),
            this.toggleTimeRow();
    }
    change(a) {
        this.validate(a.target) &&
            ((this.storage[a.target.name] =
                "checkbox" === a.target.type ? a.target.checked : a.target.value),
                this.saveStorage(),
                this.toggleTimeRow());
    }
    validate(a) {
        return "time" !== a.type || /^\d\d:\d\d$/.test(a.value);
    }
    isValidDomain(a) {
        if ("string" != typeof a) return !1;
        let b = a.split(".");
        if (1 >= b.length) return !1;
        let c = b.pop(),
            d = /^[a-zA-Z0-9]+$/gi;
        if (!d.test(c)) return !1;
        let e = b.every(function (a) {
            let b = /^(?!:\/\/)([a-zA-Z0-9]+|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9])$/gi;
            return b.test(a);
        });
        return e;
    }
    isValidURL(a) {
        let b = /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
        return b.test(a);
    }
    toggleTimeRow() {
        const b = "custom" === this.storage.schedule ? "show" : "hide";
        $(".time-row")[b]();
    }
}
const opts = new Options();
