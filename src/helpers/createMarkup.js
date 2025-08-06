import DOMPurify from 'dompurify';

const createMarkup = html => ({
  __html: DOMPurify.sanitize(html)
});

export default createMarkup;