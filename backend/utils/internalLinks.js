function generateInternalLinks(currentPage, allPages) {
  const links = [];

  // same airline
  const sameAirline = allPages.filter(p =>
    p.airline === currentPage.airline && p.slug !== currentPage.slug
  ).slice(0, 5);

  // different airline
  const otherAirline = allPages.filter(p =>
    p.airline !== currentPage.airline
  ).slice(0, 5);

  const selected = [...sameAirline, ...otherAirline];

  selected.forEach(p => {
    links.push(`<li><a href="/page/${p.slug}">${p.title}</a></li>`);
  });

  return `<ul>${links.join("")}</ul>`;
}

module.exports = generateInternalLinks;
