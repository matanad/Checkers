export const createEventEmitter = () => {
    const eventTarget = new EventTarget();

    return {
        on(evName, listener) {
            const eventListener = (event) => listener(event.detail);
            eventTarget.addEventListener(evName, eventListener);

            return () => {
                eventTarget.removeEventListener(evName, eventListener);
            };
        },
        emit(evName, data) {
            const event = new CustomEvent(evName, { detail: data });
            eventTarget.dispatchEvent(event);
        }
    };
}
