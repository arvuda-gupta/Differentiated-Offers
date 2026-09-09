export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  } catch (err) {
    return dateString;
  }
};

export const formatRelativeTime = (dateString) => {
  if (!dateString) return 'Recently';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays}d ago`;
    return formatDate(dateString);
  } catch (err) {
    return dateString;
  }
};

export const getCountryFlag = (countryCode) => {
  const flags = {
    FR: '🇫🇷',
    DE: '🇩🇪',
    NL: '🇳🇱',
    BE: '🇧🇪',
    IT: '🇮🇹',
    ES: '🇪🇸',
    PL: '🇵🇱',
    UK: '🇬🇧',
    RO: '🇷🇴',
    HU: '🇭🇺',
    GR: '🇬🇷',
    PT: '🇵🇹',
    AT: '🇦🇹',
  };
  return flags[countryCode] || '🇪🇺';
};
