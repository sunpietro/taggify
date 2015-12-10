(function (window, document, console) {
    'use strict';

    window.Taggify = function (params) {
        var CLASS_TAGGIFY = 'taggify',
            CLASS_TAGGIFY_WRAPPER = CLASS_TAGGIFY + '__wrapper',
            CLASS_TAGGIFY_INPUT = CLASS_TAGGIFY_WRAPPER + '__input',
            CLASS_TAGGIFY_INPUT_EMPTY = CLASS_TAGGIFY_INPUT + '--empty',
            CLASS_TAGGIFY_LABEL = CLASS_TAGGIFY_WRAPPER + '__label',
            CLASS_TAGGIFY_RESULTS = CLASS_TAGGIFY_WRAPPER + '__results',
            CLASS_TAGGIFY_TAGS = CLASS_TAGGIFY + '__tags',
            CLASS_TAGGIFY_TAG = CLASS_TAGGIFY_TAGS + '__tag',
            CLASS_TAGGIFY_TAG_LABEL = CLASS_TAGGIFY_TAG + '__label',
            CLASS_TAGGIFY_TAG_REMOVE = CLASS_TAGGIFY_TAG + '__remove',
            SELECTOR_TAGGIFY = '.' + CLASS_TAGGIFY,
            SELECTOR_TAG = '.' + CLASS_TAGGIFY_TAG,
            KEY_COMMA = 188,
            KEY_ENTER = 13,
            dummyCallback = function (event) { return event; },
            finalParams = {
                containerSelector: SELECTOR_TAGGIFY,
                autocomplete: false,
                autocompleteCallback: dummyCallback,
                inputPlaceholder: 'Start typing ...',
                allowDuplicates: false
            },
            taggifyId = CLASS_TAGGIFY + '-' + Date.now(),
            taggifyInput = document.createElement('input'),
            taggifyLabel = document.createElement('label'),
            taggifyTags = document.createElement('div'),
            taggifyResults = document.createElement('div'),
            taggifyInputWrapper = document.createElement('div'),
            paramKey,
            taggifyContainer,
            createdTags,
            _inputKeyupEventHandler = function (event) {
                if (event.target.value.length && event.target.classList.contains(CLASS_TAGGIFY_INPUT_EMPTY)) {
                    event.target.classList.remove(CLASS_TAGGIFY_INPUT_EMPTY);
                } else {
                    event.target.classList.add(CLASS_TAGGIFY_INPUT_EMPTY);
                }

                if ((event.keyCode || event.which) === KEY_COMMA || (event.keyCode || event.which) === KEY_ENTER) {
                    _createTags(event);
                }
            },
            _createTags = function (event) {
                var tagsMap = {},
                    tagsFragment = document.createDocumentFragment(),
                    tags = event.target.value
                        .split(',')
                        .map(function (tag) {
                            return tag.trim();
                        })
                        .filter(function (tag) {
                            if (!finalParams.allowDuplicates) {
                                if (tagsMap[tag]) {
                                    return false;
                                }

                                tagsMap[tag] = true;

                                return tag;
                            } else {
                                return !!tag.length;
                            }
                        });

                event.target.value = tags.join(', ') + ', ';

                tags.forEach(function (tag) {
                    var elementTag = document.createElement('div'),
                        elementTagLabel = document.createElement('span'),
                        elementTagRemove = document.createElement('button');

                    elementTagLabel.classList.add(CLASS_TAGGIFY_TAG_LABEL);
                    elementTagLabel.innerHTML = tag;

                    elementTagRemove.classList.add(CLASS_TAGGIFY_TAG_REMOVE);

                    elementTag.classList.add(CLASS_TAGGIFY_TAG);
                    elementTag.dataset.tagText = tag;
                    elementTag.appendChild(elementTagLabel);
                    elementTag.appendChild(elementTagRemove);

                    tagsFragment.appendChild(elementTag);
                });

                createdTags = tags;
                taggifyTags.innerHTML = '';
                taggifyTags.appendChild(tagsFragment);
            },
            _getElement = function (element, callback) {
                var parent = element.parentNode;

                if (!parent) { return undefined; }
                if (callback(element)) { return element; }

                return callback(parent) ? parent : _getElement(parent, callback);
            },
            _isTagCallback = function (element) { return (element.classList && element.classList.contains(CLASS_TAGGIFY_TAG)); },
            _isTagRemoveButtonCallback = function (element) { return (element.classList && element.classList.contains(CLASS_TAGGIFY_TAG_REMOVE)); },
            _removeTag = function (event) {
                var tagRemoveBtn = _getElement(event.target, _isTagRemoveButtonCallback),
                    tags = Array.prototype.slice.call(this.querySelectorAll(SELECTOR_TAG)),
                    tag;

                if (tagRemoveBtn) {
                    tag = _getElement(event.target, _isTagCallback);

                    createdTags.splice(tags.indexOf(tag), 1);

                    taggifyInput.value = createdTags.join(', ') + ', ';

                    this.removeChild(tag);
                }
            };

        // merge the object with default config with an object with params provided by a developer
        for (paramKey in params) {
            if (params.hasOwnProperty(paramKey)) {
                finalParams[paramKey] = params[paramKey];
            }
        }

        taggifyContainer = document.querySelector(finalParams.containerSelector);
        taggifyContainer.innerHTML = '';

        taggifyInputWrapper.classList.add(CLASS_TAGGIFY_WRAPPER);

        taggifyLabel.for = taggifyId;
        taggifyLabel.innerHTML = finalParams.inputPlaceholder;

        taggifyLabel.setAttribute('for', taggifyId);
        taggifyLabel.classList.add(CLASS_TAGGIFY_LABEL);

        taggifyInput.id = taggifyId;
        taggifyInput.type = 'text';
        taggifyInput.classList.add(CLASS_TAGGIFY_INPUT);
        taggifyInput.classList.add(CLASS_TAGGIFY_INPUT_EMPTY);

        taggifyResults.classList.add(CLASS_TAGGIFY_RESULTS);
        taggifyTags.classList.add(CLASS_TAGGIFY_TAGS);

        taggifyContainer.appendChild(taggifyInputWrapper);
        taggifyContainer.appendChild(taggifyTags);

        taggifyInputWrapper.appendChild(taggifyInput);
        taggifyInputWrapper.appendChild(taggifyLabel);
        taggifyInputWrapper.appendChild(taggifyResults);

        taggifyInput.addEventListener('keyup', _inputKeyupEventHandler, false);
        taggifyTags.addEventListener('click', _removeTag, false);
    };

    new window.Taggify();
})(window, window.document, window.console);
