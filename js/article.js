/* Youtalk — article page scripts */
(function () {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init, {once: true});
    } else {
        init();
    }

    function init() {
        const post = document.querySelector(".post");
        const tocList = document.getElementById("toc-list");
        if (!post || !tocList) return;

        buildTOC(post, tocList);
        observeHeadings(post);
    }

    function slugify(text) {
        return String(text)
            .trim()
            .toLowerCase()
            .replace(/[^\w\u0400-\u04FF -]/g, "")
            .replace(/\s+/g, "-");
    }

    function buildTOC(scope, listEl) {
        const headings = Array.from(scope.querySelectorAll("h2, h3"))
            .filter(h => !h.closest(".toc"));        // <-- игнорируем заголовок в блоке TOC

        let subList = null;
        headings.forEach((h) => {
            if (!h.id) h.id = slugify(h.textContent);

            const li = document.createElement("li");
            li.className = "toc__item toc__item--" + h.tagName.toLowerCase();

            const a = document.createElement("a");
            a.className = "toc__link";
            a.href = "#" + h.id;
            a.textContent = h.textContent.trim();
            li.appendChild(a);

            if (h.tagName === "H2") {
                listEl.appendChild(li);
                subList = null;
            } else {
                let parent = listEl.lastElementChild;
                if (!parent) {
                    parent = document.createElement("li");
                    listEl.appendChild(parent);
                }
                if (!subList) {
                    subList = document.createElement("ul");
                    subList.className = "toc__sub";
                    parent.appendChild(subList);
                }
                subList.appendChild(li);
            }
        });
    }

    function observeHeadings(scope) {
        const links = Array.from(document.querySelectorAll(".toc__link"));
        if (!("IntersectionObserver" in window) || links.length === 0) return;

        const map = new Map(links.map(a => [a.getAttribute("href").slice(1), a]));
        const io = new IntersectionObserver((entries) => {
            entries.forEach((e) => {
                if (e.isIntersecting) {
                    const a = map.get(e.target.id);
                    if (!a) return;
                    links.forEach(l => l.removeAttribute("aria-current"));
                    a.setAttribute("aria-current", "true");
                }
            });
        }, {rootMargin: "-60% 0px -35% 0px", threshold: 0});

        scope.querySelectorAll("h2, h3").forEach(h => io.observe(h));
    }
})();
