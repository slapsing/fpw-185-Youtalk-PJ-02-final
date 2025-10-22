(() => {
    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
    const key = (s) => (s || '').toString().trim().toLowerCase();

    const tagsBar = $('.tags');
    if (!tagsBar) return;

    const tagButtons = () => $$('.tags__item');
    const cards = () => $$('.card');

    const emptyState = $('#cards-empty'); 
    const countRegion = $('#cards-count');

    const getBtnTag = (btn) => btn?.dataset?.tag ? btn.dataset.tag : btn?.textContent || '';
    const getBadgeTag = (el) => el?.dataset?.tag ? el.dataset.tag : el?.textContent || '';
    const announce = (el, text) => {
        if (!el) return;
        el.hidden = false;
        requestAnimationFrame(() => {
            el.textContent = text;
        });
    };

    tagButtons().forEach((btn) => {
        const active = btn.classList.contains('tags__item--active');
        btn.setAttribute('aria-pressed', active ? 'true' : 'false');
        if (!btn.hasAttribute('type')) btn.setAttribute('type', 'button');
    });

    // Выбранные теги, кроме «Все»
    const selectedTags = () =>
        tagButtons()
            .filter((b) => b.classList.contains('tags__item--active') && getBtnTag(b).trim() !== 'Все')
            .map((b) => key(getBtnTag(b)));

    const syncAria = () => {
        tagButtons().forEach((btn) => {
            btn.setAttribute('aria-pressed', btn.classList.contains('tags__item--active') ? 'true' : 'false');
        });
    };

    // Теги карточки
    const getCardTags = (card) => {
        if (card.dataset.tags) {
            return card.dataset.tags.split(',').map(t => key(t)).filter(Boolean);
        }
        return $$('.badge[data-tag]', card).map(b => key(b.dataset.tag));
    };

    const applyFilter = () => {
        const selected = selectedTags();
        let visibleCount = 0;

        cards().forEach((card) => {
            const list = getCardTags(card);
            const show = selected.length === 0 ? true : selected.some((t) => list.includes(t));
            card.hidden = !show;
            if (show) visibleCount++;
        });

        // Обновляем live-regions
        if (visibleCount === 0) {
            announce(emptyState, 'По выбранным тегам ничего не найдено.');
            if (countRegion) countRegion.textContent = ''; // чтобы не дублировать озвучку
        } else {
            if (emptyState) {
                emptyState.hidden = true;
                emptyState.textContent = '';
            }
            if (countRegion) {
                // Мягкая подсказка о количестве результатов
                countRegion.textContent = `Найдено статей: ${visibleCount}.`;
            }
        }
    };

    // Клики по верхним чипам
    tagsBar.addEventListener('click', (e) => {
        const btn = e.target.closest('.tags__item');
        if (!btn) return;

        const label = getBtnTag(btn).trim();
        if (label === 'Все') {
            tagButtons().forEach((b) => b.classList.remove('tags__item--active'));
        } else {
            btn.classList.toggle('tags__item--active');
            const allBtn = tagButtons().find((b) => getBtnTag(b).trim() === 'Все');
            if (allBtn) allBtn.classList.remove('tags__item--active');
        }
        syncAria();
        applyFilter();
    });

    document.addEventListener('click', (e) => {
        const badge = e.target.closest('.badge');
        if (!badge) return;

        const label = getBadgeTag(badge).trim();
        const chip = tagButtons().find((b) => key(getBtnTag(b)) === key(label));
        if (!chip) return;

        chip.classList.add('tags__item--active');

        const allBtn = tagButtons().find((b) => getBtnTag(b).trim() === 'Все');
        if (allBtn) allBtn.classList.remove('tags__item--active');

        syncAria();
        applyFilter();

        tagsBar.scrollIntoView({behavior: 'smooth', block: 'nearest'});
    });

    applyFilter();
})();
