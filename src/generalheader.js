(function(window) {
    var pointerEnabled = window.navigator.msPointerEnabled,
        iBoxUtils = window.iBoxUtils;

    /**
     * @class iBox.GeneralHeader
     */
    iBox.GeneralHeader = Klass.define(iBox.Header, {
        /**
         * @cfg {String} title 标题
         */

        /**
         * @cfg {Object/String} leftButton 配置左侧按钮
         *      String : text
         *      String : icon 图标url
         *      Function : handler click回调函数
         */

        /**
         * @cfg {Object/String} rightButton 配置右侧按钮
         *      String : text
         *      Function : handler click回调函数
         */

        doRender: function() {
            var div, options = this.title;
            if (options) {
                options = iBoxUtils.isString(options) ? { text: options } : options;
                div = document.createElement('div');
                div.innerHTML = '<div>' + options.text + '</div>';
                div.className = 'button title' + (options.cls ? (' ' + options.cls) : '');
                div.setAttribute('data-view', this.viewId);
                div.style.cssText = 'display:none;';
                this.ct.appendChild(div);
                this.title = div;
                div = null;
            } else {
                this.title = this.ct.querySelector('div.title[data-view="' + this.id + '"]');
            }

            this.renderButton(this.leftButton, true);
            this.renderButton(this.rightButton, false);
        },

        renderButton: function(options, isLeft) {
            var text = isLeft ? 'left' : 'right',
                buttonProp = text + 'Button',
                buttonHighlightHandlerProp = text + 'ButtonHighlightHandler',
                buttonHandlerProp = text + 'ButtonHandler',
                div, handler, btn;
            if (options) {
                options = iBoxUtils.isString(options) ? { text: options } : options;
                handler = options.handler;
                div = document.createElement('div');
                div.innerHTML = (isLeft ? '<img src="' + (options.icon || (iBoxUtils.BLANK_IMAGE + '" class="back"')) + ' />' : '') + '<div>' + options.text + '</div>';
                div.className = 'button ' + text + (options.cls ? (' ' + options.cls) : '');
                div.style.cssText = 'display:none;';
                div.setAttribute('data-view', this.viewId);
                this.ct.appendChild(div);
                this[buttonProp] = btn = div;
                div = null;
            } else {
                this[buttonProp] = btn = this.ct.querySelector('div.' + text + '[data-view="' + this.id + '"]');
                if (btn) {
                    handler = iBoxUtils.queryFunction(btn.getAttribute('data-handler'));
                }
            }
            if (handler) {
                if (iBoxUtils.isMobile()) {
                    this[buttonHighlightHandlerProp] = this.createButtonHandler(btn);
                    this[buttonHandlerProp] = iBoxUtils.proxy(options.handler, this);
                    btn.addEventListener(pointerEnabled ? 'MSPointerDown' : 'touchstart', this[buttonHighlightHandlerProp], false);
                    btn.addEventListener(pointerEnabled ? 'MSPointerUp' : 'touchend', this[buttonHandlerProp], false);
                } else {
                    this[buttonHandlerProp] = this.createButtonHandler(btn, options.handler);
                    btn.addEventListener('click', this[buttonHandlerProp], false);
                }
            }
        },

        createButtonHandler: function(el, fn) {
            var me = this;
            return function() {
                iBoxUtils.addClass(el, 'highlighted');
                if (fn) fn.call(me);
            };
        },

        doSlide: function(reverse, action, silent, callbackFn) {
            var me = this,
                cssVendor = iBoxUtils.vendor.cssVendor,
                direction = reverse ? 'right' : 'left',
                leftButton = me.leftButton, leftText,
                rightButton = me.rightButton,
                title = me.title,
                headerWidth = iBoxUtils.getComputedSize(me.ct).innerWidth,
                titleWidth, leftWidth, rightWidth, titleLeft, leftInnerWidth, leftTextWidth,
                minLeftWidth = 70,
                leftBeforeCss, leftTextBeforeCss, rightBeforeCss, titleBeforeCss,
                leftAfterCss, leftTextAfterCss, rightAfterCss, titleAfterCss,
                duration = 350, opacityDuration = 300, defer = 50;

            if (action == 'in') {
                if (leftButton) leftButton.style.cssText = 'display:block;' + cssVendor + 'transform:translate3d(-1000px,-1000px,0px);';
                if (rightButton) rightButton.style.cssText = 'display:block;' + cssVendor + 'transform:translate3d(-1000px,-1000px,0px);';
                if (title) title.style.cssText = 'display:block;' + cssVendor + 'transform:translate3d(-1000px,-1000px,0px);';
            }

            leftWidth = leftButton ? iBoxUtils.getComputedSize(leftButton).outerWidth : 0;
            rightWidth = rightButton ? iBoxUtils.getComputedSize(rightButton).outerWidth : 0;
            titleWidth = title ? iBoxUtils.getComputedSize(title).outerWidth : 0;
            if (headerWidth < leftWidth + rightWidth + titleWidth) {
                leftWidth = headerWidth - titleWidth - rightWidth;
            }
            if (leftWidth < minLeftWidth) {
                leftWidth = minLeftWidth;
            }
            titleLeft = (headerWidth - titleWidth) / 2;
            titleLeft = (titleLeft + titleWidth + rightWidth > headerWidth) ? (headerWidth - titleWidth - rightWidth) / 2 : titleLeft;
            titleLeft = titleLeft < leftWidth ? leftWidth : titleLeft;

            if (leftButton) {
                iBoxUtils.removeClass(leftButton, 'highlighted');
                leftText = leftButton.querySelector('div');
                leftInnerWidth = iBoxUtils.getComputedSize(leftButton, leftWidth).innerWidth;
                leftTextWidth = iBoxUtils.getComputedSize(leftText, leftInnerWidth).innerWidth;
                leftAfterCss = 'display:block;width:' + leftInnerWidth + 'px;opacity:' + (action == 'in' ? '1' : '0') + ';' + (silent === true ? '' : cssVendor + 'transition:' + 'opacity ' + opacityDuration + 'ms;');
                leftTextAfterCss = 'width:' + leftTextWidth + 'px;' + cssVendor + 'transform:translate3d(' + (action == 'in' ? 0 : (direction == 'left' ? -leftWidth : titleLeft)) + 'px,0px,0px);' + (silent === true ? '' : '' + cssVendor + 'transition:' + cssVendor + 'transform ' + duration + 'ms;');
                if (silent !== true) {
                    if (action == 'in') {
                        leftBeforeCss = 'display:block;width:' + leftInnerWidth + 'px;opacity:0;';
                        leftTextBeforeCss = 'width:' + leftTextWidth + 'px;' + cssVendor + 'transform:translate3d(' + (direction == 'left' ? titleLeft : -leftWidth) + 'px,0px,0px);';
                        leftButton.style.cssText = leftBeforeCss;
                        leftText.style.cssText = leftTextBeforeCss;
                    }
                    iBoxUtils.listenTransition(leftButton, duration + defer, function() {
                        if (action != 'in' && me.leftButton) me.leftButton.style.display = 'none';
                    });
                    setTimeout(function() {
                        leftButton.style.cssText = leftAfterCss;
                        leftText.style.cssText = leftTextAfterCss;
                    }, defer);
                } else {
                    leftButton.style.cssText = leftAfterCss;
                    leftText.style.cssText = leftTextAfterCss;
                    if (action != 'in') leftButton.style.display = 'none';
                }
            }
            if (rightButton) {
                iBoxUtils.removeClass(rightButton, 'highlighted');
                rightAfterCss = 'display:block;opacity:' + (action == 'in' ? '1' : '0') + ';' + (silent === true ? '' : cssVendor + 'transition:opacity ' + opacityDuration + 'ms;');
                if (silent !== true) {
                    if (action == 'in') {
                        rightBeforeCss = 'display:block;opacity:0;';
                        rightButton.style.cssText = rightBeforeCss;
                    }
                    iBoxUtils.listenTransition(rightButton, duration + defer, function() {
                        if (action != 'in' && me.rightButton) me.rightButton.style.display = 'none';
                    });
                    setTimeout(function() {
                        rightButton.style.cssText = rightAfterCss;
                    }, defer);
                } else {
                    rightButton.style.cssText = rightAfterCss;
                    if (action != 'in') rightButton.style.display = 'none';
                }
            }
            if (title) {
                titleAfterCss = 'display:block;opacity:' + (action == 'in' ? '1' : '0') + ';' + cssVendor + 'transform:translate3d(' + (action == 'in' ? titleLeft : (direction == 'left' ? 30 : headerWidth)) + 'px,0px,0px);' + (silent === true ? '' : cssVendor + 'transition:' + cssVendor + 'transform ' + duration + 'ms,opacity ' + opacityDuration + 'ms;');
                if (silent !== true) {
                    if (action == 'in') {
                        titleBeforeCss = 'display:block;opacity:0;' + cssVendor + 'transform:translate3d(' + (direction == 'left' ? (headerWidth - titleWidth / 2) : 0) + 'px,0px,0px);';
                        title.style.cssText = titleBeforeCss;
                    }
                    iBoxUtils.listenTransition(title, duration + defer, function() {
                        if (action != 'in' && me.title) me.title.style.display = 'none';
                        if (callbackFn) callbackFn.call(me);
                    });
                    setTimeout(function() {
                        title.style.cssText = titleAfterCss;
                    }, defer);
                } else {
                    title.style.cssText = titleAfterCss;
                    if (action != 'in') title.style.display = 'none';
                    if (callbackFn) callbackFn.call(me);
                }
            }
        },

        doDestroy: function() {
            if (this.title) {
                iBoxUtils.removeElement(this.title);
                this.title = null;
            }
            this.destroyButton(true);
            this.destroyButton(false);
        },

        destroyButton: function(isLeft) {
            var text = isLeft ? 'left' : 'right',
                buttonProp = text + 'Button',
                buttonHighlightHandlerProp = text + 'ButtonHighlightHandler',
                buttonHandlerProp = text + 'ButtonHandler',
                btn = this[buttonProp];

            if (btn) {
                if (iBoxUtils.isMobile()) {
                    btn.removeEventListener(pointerEnabled ? 'MSPointerDown' : 'touchstart', this[buttonHighlightHandlerProp], false);
                    btn.removeEventListener(pointerEnabled ? 'MSPointerUp' : 'touchend', this[buttonHandlerProp], false);
                } else {
                    btn.removeEventListener('click', this[buttonHandlerProp], false);
                }
                iBoxUtils.removeElement(btn);
                this[buttonProp] = null;
            }
        }
    });
})(window);