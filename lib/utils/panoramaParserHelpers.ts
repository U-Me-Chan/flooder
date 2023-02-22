import { parseDocument } from 'htmlparser2';
import { findOne, findAll, textContent } from 'domutils';

export const textMetrikaCleanUp = (text: string) => {
  let copy = `${text}`;

  const metrikaStrings = [
    'window.yaContextCb.push(()=>{',
    'Ya.Context.AdvManager.render({',
    'renderTo: \'yandex_rtb_R-A-1729988-1\',',
    'blockId: \'R-A-1729988-1\'',
    '})',
    '})',
  ];

  for (const chunk of metrikaStrings) {
    copy = copy.replace(chunk, '');
  }

  return copy.split('\r\n').join('').split('\n').map(_ => _.trim()).filter(_ => _.length > 1).join(' ');
}

export const parsePage = (rawHtml: string): { text: string; comments: string[] } => {
  const textClass = 'entry-contents pr-0 md:pr-8';
  const commentTextClass = 'px-1 py-2 typo';
  const parsed = parseDocument(rawHtml);

  let text = '';
  let comments = [] as string[];

  const textParent = findOne(
    (elm) => elm?.attribs?.class === textClass,
    parsed.childNodes,
    true,
  );

  const commentsNodes = findAll((elm) => elm?.attribs?.class === commentTextClass, parsed.childNodes);

  if (!textParent) {
    return {
      text,
      comments,
    };
  }

  text = textMetrikaCleanUp(textContent(textParent).trim());
  comments = commentsNodes.map(_ => textContent(_).trim());

  return {
    text,
    comments,
  };
}

export const parseDatePresented = (rawHtml: string): { title: string; url: string; }[] => {
  const linkTextClass = 'pt-2 text-xl lg:text-lg xl:text-base text-center font-semibold';
  const linkClass = 'flex flex-col rounded-md hover:text-secondary hover:bg-accent/[.1] mb-2';
  const newsParentNodeClass = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-5 gap-x-2.5 gap-y-4 lg:gap-y-2.5';
  const parsed = parseDocument(rawHtml);

  const newsParent = findOne(
    (elm) => elm?.attribs?.class === newsParentNodeClass,
    parsed.childNodes,
    true,
  );

  if (!newsParent) {
    return [];
  }

  const links = findAll((elm) => elm?.attribs?.class === linkClass, [newsParent]);

  return links.map(link => {
    const titleElm = findOne((elm => elm?.attribs?.class === linkTextClass), [link], true);

    return {
      url: link?.attribs?.href,
      title: titleElm ? textContent(titleElm)?.trim() : '',
    };
  });
};
