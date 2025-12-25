export const formatDateSeparator = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
        return 'Hoy';
    } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Ayer';
    }
    return date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
};

export const shouldShowDateSeparator = (currentMsg, prevMsg) => {
    if (!currentMsg) return false;
    if (!prevMsg) return true;

    const currentDate = new Date(currentMsg.created_at).toDateString();
    const prevDate = new Date(prevMsg.created_at).toDateString();

    return currentDate !== prevDate;
};
