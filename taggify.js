(function (window, document) {
    'use strict';

    window.Taggify = function (params) {
        var CLASS_TAGGIFY = 'taggify',
            CLASS_TAGGIFY_WRAPPER = CLASS_TAGGIFY + '__wrapper',
            CLASS_TAGGIFY_INPUT = CLASS_TAGGIFY_WRAPPER + '__input',
            CLASS_TAGGIFY_LABEL = CLASS_TAGGIFY_WRAPPER + '__label',
            CLASS_TAGGIFY_RESULTS = CLASS_TAGGIFY_WRAPPER + '__results',
            CLASS_TAGGIFY_TAGS = CLASS_TAGGIFY + '__tags',
            CLASS_TAGGIFY_TAG = CLASS_TAGGIFY_TAGS + '__tag',
            CLASS_TAGGIFY_TAG_LABEL = CLASS_TAGGIFY_TAG + '__label',
            CLASS_TAGGIFY_TAG_REMOVE = CLASS_TAGGIFY_TAG + '__remove',
            SELECTOR_TAGGIFY = '.' + CLASS_TAGGIFY,
            DIV = 'div',
            KEY_COMMA = 188,
            KEY_ENTER = 13,
            dummyCallback = function (value, callback) { callback(value); },
            finalParams = {
                /**
                 * Container selector to find HTML node to initialize taggify element
                 *
                 * @property containerSelector
                 * @type {String}
                 * @default '.taggify'
                 */
                containerSelector: SELECTOR_TAGGIFY,
                /**
                 * Indicator whether to use autocomplete callback
                 *
                 * @property autocomplete
                 * @type {Boolean}
                 * @default false
                 */
                autocomplete: false,
                /**
                 * Indicator whether to use autocomplete callback
                 *
                 * @property autocompleteCallback
                 * @type {Function}
                 * @default dummyCallback
                 */
                autocompleteCallback: dummyCallback,
                /**
                 * The input delay. After this time, the tags are created.
                 *
                 * @property inputDelay
                 * @type {Number}
                 * @default 100
                 */
                inputDelay: 100,
                /**
                 * The text to display to a user
                 *
                 * @property inputLabel
                 * @type {String}
                 * @default 'Start typing ...'
                 */
                inputLabel: 'Start typing ...',
                /**
                 * Indicator whether to allow duplicated tags.
                 * Used when autocomplete is turned off.
                 *
                 * @property allowDuplicates
                 * @type {Boolean}
                 * @default false
                 */
                allowDuplicates: false,
                /**
                 * List of hot keys which generate tags when autocomplete is off.
                 * The list contains key codes, like - coma is 188, but enter is 13.
                 *
                 * @property hotKeys
                 * @type {Array}
                 * @default ['[,]', '[enter]']
                 */
                hotKeys: [KEY_COMMA, KEY_ENTER]
            },
            taggifyId = CLASS_TAGGIFY + '-' + Date.now(),
            taggifyInput = document.createElement('input'),
            taggifyLabel = document.createElement('label'),
            taggifyTags = document.createElement(DIV),
            taggifyResults = document.createElement(DIV),
            taggifyInputWrapper = document.createElement(DIV),
            paramKey,
            taggifyContainer,
            createdTags,
            timeoutInputKeyup,
            /**
             * Input keyup event callback.
             * Fired when autocomplete is turned off.
             * When a user types a comma or presses the enter key it starts creating tags from the input text.
             * A coma-separated text is converted into tags.
             *
             * @method _createTagsNoAutocomplete
             * @private
             * @param event {Object} input keyup event object
             */
            _createTagsNoAutocomplete = function (event) {
                var tagsMap = {},
                    isHotKeyUsed = finalParams.hotKeys.some(function (key) {
                        return (event.keyCode || event.which) === key;
                    }),
                    tags;

                if (isHotKeyUsed) {
                    tags = event.target.value
                        .split(',')
                        .map(function (tag, index) {
                            return {
                                id: index,
                                label: tag.trim()
                            };
                        })
                        .filter(function (tag) {
                            if (!finalParams.allowDuplicates) {
                                if (!tag.label.length || tagsMap[tag.label]) {
                                    return false;
                                }

                                tagsMap[tag.label] = true;

                                return tag;
                            } else {
                                return !!tag.label.length;
                            }
                        });

                    event.target.value = tags.map(function (tag) { return tag.label; }).join(', ') + ', ';
                    _createTags(tags);
                }
            },
            /**
             * Input keyup event handler.
             * Basing on provided config it either provides data to autocomplete callback
             * or creates tags from user input with a delay.
             *
             * @method _inputKeyupEventHandler
             * @private
             * @param event {Object} input keyup event object
             */
            _inputKeyupEventHandler = function (event) {
                window.clearTimeout(timeoutInputKeyup);

                timeoutInputKeyup = window.setTimeout(function () {
                    if (finalParams.autocomplete) {
                        finalParams.autocompleteCallback(event.target.value, _createTags);
                    } else {
                        _createTagsNoAutocomplete(event);
                    }
                }, finalParams.inputDelay);
            },
            /**
             * Creates tags
             *
             * @method _createTags
             * @private
             * @param tags {Array} an array of tag objects (id, label)
             */
            _createTags = function (tags) {
                var tagsFragment = document.createDocumentFragment();

                tags.forEach(function (tag) {
                    var elementTag = document.createElement(DIV),
                        elementTagLabel = document.createElement('span'),
                        elementTagRemove = document.createElement('button');

                    elementTagLabel.classList.add(CLASS_TAGGIFY_TAG_LABEL);
                    elementTagLabel.innerHTML = tag.label;

                    elementTagRemove.classList.add(CLASS_TAGGIFY_TAG_REMOVE);

                    elementTag.classList.add(CLASS_TAGGIFY_TAG);
                    elementTag.dataset.tagText = tag.label;
                    elementTag.dataset.tagId = tag.id;

                    elementTag.appendChild(elementTagLabel);
                    elementTag.appendChild(elementTagRemove);

                    tagsFragment.appendChild(elementTag);
                });

                createdTags = tags;

                if (!finalParams.autocomplete) {
                    taggifyTags.innerHTML = '';
                } else {
                    taggifyInput.value = '';
                }

                taggifyTags.appendChild(tagsFragment);
            },
            /**
             * Gets an element based on filtered using a provided callback
             *
             * @method _getElement
             * @private
             * @param element {HTMLElement} the HTML node element
             * @param callback {Function} the comparison callback to find element
             * @return element {HTMLElement|undefined}
             */
            _getElement = function (element, callback) {
                var parent = element.parentNode;

                if (!parent) { return undefined; }
                if (callback(element)) { return element; }

                return callback(parent) ? parent : _getElement(parent, callback);
            },
            /**
             * The comparison callback finding tag element
             *
             * @method _isTagCallback
             * @private
             * @param element {HTMLElement} the HTML node element
             * @return {Boolean}
             */
            _isTagCallback = function (element) { return (element.classList && element.classList.contains(CLASS_TAGGIFY_TAG)); },
            /**
             * The comparison callback finding remove tag button
             *
             * @method _isTagRemoveButtonCallback
             * @private
             * @param element {HTMLElement} the HTML node element
             * @return {Boolean}
             */
            _isTagRemoveButtonCallback = function (element) { return (element.classList && element.classList.contains(CLASS_TAGGIFY_TAG_REMOVE)); },
            /**
             * Click event handler.
             * Removes a selected tag.
             *
             * @method _removeTag
             * @private
             * @param event {Object} input keyup event object
             */
            _removeTag = function (event) {
                var tagRemoveBtn = _getElement(event.target, _isTagRemoveButtonCallback),
                    inputText = '',
                    tag;

                if (tagRemoveBtn) {
                    tag = _getElement(event.target, _isTagCallback);

                    createdTags = createdTags.filter(function (createdTag) {
                        var createdTagId = '' + createdTag.id,
                            tagId = '' + tag.dataset.tagId;

                        return createdTagId !== tagId;
                    });

                    if (!finalParams.autocomplete) {
                        inputText = createdTags.map(function (tag) { return tag.label; }).join(', ') + ', ';
                    }

                    taggifyInput.value = inputText;

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
        taggifyLabel.innerHTML = finalParams.inputLabel;

        taggifyLabel.setAttribute('for', taggifyId);
        taggifyLabel.classList.add(CLASS_TAGGIFY_LABEL);

        taggifyInput.id = taggifyId;
        taggifyInput.type = 'text';
        taggifyInput.classList.add(CLASS_TAGGIFY_INPUT);

        taggifyResults.classList.add(CLASS_TAGGIFY_RESULTS);
        taggifyTags.classList.add(CLASS_TAGGIFY_TAGS);

        taggifyContainer.appendChild(taggifyInputWrapper);
        taggifyContainer.appendChild(taggifyTags);

        taggifyInputWrapper.appendChild(taggifyLabel);
        taggifyInputWrapper.appendChild(taggifyInput);
        taggifyInputWrapper.appendChild(taggifyResults);

        taggifyInput.addEventListener('keyup', _inputKeyupEventHandler, false);
        taggifyTags.addEventListener('click', _removeTag, false);
    };
})(window, window.document);
