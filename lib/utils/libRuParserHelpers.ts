import { parseDocument } from 'htmlparser2';
import { Document } from 'domhandler';
import { getElementsByTagName, textContent } from 'domutils';
const { decode } = require('single-byte');

export const LibRuGetDOM = (html: string): Document => {
  const decoded = decode('koi8-r', Buffer.from(html));
  return parseDocument(decoded);
}

export const LibRuGetLinksInDOM = (dom: Document) => {
  const linksElements = getElementsByTagName(
    (tagName) => ['a', 'A'].includes(tagName),
    dom,
    true,
  );

  return linksElements
    .filter((elm) => elm.attribs.href !== undefined && !elm.attribs.href?.startsWith('http://'))
    .map(elm => elm.attribs.href);
}

export const LibRuGetBookText = (dom: Document) => {
  const body = getElementsByTagName('body', dom);
  const firstPre = getElementsByTagName('pre', body);

  console.log(firstPre)

  return textContent(firstPre);
}
