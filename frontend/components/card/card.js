Component({
    properties: {
        type: {
            type: String,
            value: 'heart'
        },
        value: {
            type: String,
            value: 'A'
        },
        disabled: {
            type: Boolean,
            value: false
        }
    },

    methods: {
        onTap() {
            if (!this.data.disabled) {
                this.triggerEvent('tap', {
                    type: this.data.type,
                    value: this.data.value
                }, {});
            }
        }
    }
})