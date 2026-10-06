// Crawler bodies mirror the class-page copy; visuals and interactions stay in React.
import { PRIMARY_CONTENT } from "@shared/content/primary";
import { MIDDLE_CONTENT } from "@shared/content/middle";
import { SECONDARY_CONTENT } from "@shared/content/secondary";
import { SENIOR_CONTENT } from "@shared/content/senior";

function e(value: unknown): string {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function renderPrimary(): string {
  return `<section>        <span>  ${e(PRIMARY_CONTENT.text.label1)}</span>       <p>${e(PRIMARY_CONTENT.text.heroDetail1)}</p>
       ${PRIMARY_CONTENT.inlineList1.map((t) => `<span>    ${e(t)}  </span>`).join("")}         <a href="${e("/admissions")}">${e(PRIMARY_CONTENT.text.cta1)}  </a>   <a href="${e("/admissions#campus-visit")}">${e(PRIMARY_CONTENT.text.cta2)}</a>   <a href="${e("https://wa.me/918291568972?text=Hi%2C%20I%20would%20like%20to%20enquire%20about%20Primary%20%28Class%201%E2%80%935%29%20admission%20at%20Rainbow%20International%20School.")}">  ${e(PRIMARY_CONTENT.text.cta3)}</a>      </section>
       <section>      <span>${e(PRIMARY_CONTENT.text.label2)}</span>   <h2>${e(PRIMARY_CONTENT.text.h21)}</h2>
       ${PRIMARY_CONTENT.decisionCards.map((c, i) => `    <h3>${e(c.title)}</h3>   <p>${e(c.body)}</p>
  `).join("")}       <a href="${e("/admissions")}">${e(PRIMARY_CONTENT.text.cta4)}  </a>      </section>
     <section>      <h2>${e(PRIMARY_CONTENT.text.h22)}</h2>
   <p>${e(PRIMARY_CONTENT.text.paragraph1)}</p>
             <h3>  ${e(PRIMARY_CONTENT.text.h31)}</h3>     <ul>  ${PRIMARY_CONTENT.scholastic.map(({ name }) => `<li>    <span>${e(name)}</span>  </li>`).join("")}  </ul>
           <h3>  ${e(PRIMARY_CONTENT.text.h32)}</h3>     <ul>  ${PRIMARY_CONTENT.coScholastic.map(({ name }) => `<li>    <span>${e(name)}</span>  </li>`).join("")}  </ul>
        </section>
     <section>      <h2>${e(PRIMARY_CONTENT.text.h23)}</h2>
   <p>${e(PRIMARY_CONTENT.text.paragraph2)}</p>
             ${PRIMARY_CONTENT.journey.map((j, i) => `    ${e(j.grade.replace("Class ", ""))}     <h3>${e(j.grade)}</h3>   <p>${e(j.body)}</p>
  `).join("")}             <a href="${e("/admissions")}">${e(PRIMARY_CONTENT.text.cta5)}  </a>      </section>
     <section>      <span>${e(PRIMARY_CONTENT.text.label3)}</span>   <h2>${e(PRIMARY_CONTENT.text.h24)}</h2>
   <p>${e(PRIMARY_CONTENT.text.paragraph3)}</p>
       ${PRIMARY_CONTENT.gradeAdmissions.map((g, i) => `  <span>  ${e(g.grade)}  </span>   <h3>${e(g.title)}</h3>   <p>${e(g.body)}</p>
   <a href="${e("/admissions")}">${e(PRIMARY_CONTENT.text.cta6)}  </a>  `).join("")}      </section>
     <section>      <h2>${e(PRIMARY_CONTENT.text.h25)}</h2>
   <p>${e(PRIMARY_CONTENT.text.paragraph4)}</p>
       ${PRIMARY_CONTENT.skills.map((s, i) => `    <h3>${e(s.title)}</h3>   <p>${e(s.body)}</p>
  `).join("")}      </section>
     <section>      <h2>${e(PRIMARY_CONTENT.text.h26)}</h2>
   <p>${e(PRIMARY_CONTENT.text.paragraph5)}</p>
               <p>${e(PRIMARY_CONTENT.text.paragraph6)}</p>
                 <p>${e(PRIMARY_CONTENT.text.paragraph7)}</p>
             <p>${e(PRIMARY_CONTENT.text.paragraph8)}</p>
             ${PRIMARY_CONTENT.classroom.map((c, i) => `        <h3>${e(c.title)}</h3>   <p>${e(c.body)}</p>
      `).join("")}      </section>
     <section>      <h2>${e(PRIMARY_CONTENT.text.h27)}</h2>
       ${PRIMARY_CONTENT.approach.map((a, i) => `    <h3>${e(a.title)}</h3>   <p>${e(a.body)}</p>
  `).join("")}      </section>
     <section>      <span>${e(PRIMARY_CONTENT.text.label4)}</span>   <h2>${e(PRIMARY_CONTENT.text.h28)}</h2>
   <p>${e(PRIMARY_CONTENT.text.paragraph9)}</p>
       ${PRIMARY_CONTENT.evaluationPoints.map((pt, i) => `    <p>${e(pt)}</p>
  `).join("")}       <a href="${e("/admissions")}">${e(PRIMARY_CONTENT.text.cta7)}  </a>      </section>
     <section>      <h2>${e(PRIMARY_CONTENT.text.h29)}</h2>
   <p>${e(PRIMARY_CONTENT.text.paragraph10)}</p>
       ${PRIMARY_CONTENT.transitionCards.map((t, i) => `    <h3>${e(t.title)}</h3>   <p>${e(t.body)}</p>
  `).join("")}       <a href="${e("/middle-school-section")}">${e(PRIMARY_CONTENT.text.cta8)}  </a>      </section>
     <section>        <span>${e(PRIMARY_CONTENT.text.label5)}</span>   <h2>${e(PRIMARY_CONTENT.text.h210)}</h2>
   <p>${e(PRIMARY_CONTENT.text.paragraph11)}</p>
     ${PRIMARY_CONTENT.trustItems.map((t) => `    <p>${e(t.title)}</p>
  `).join("")}            </section>
     <section>      <span>  ${e(PRIMARY_CONTENT.text.label6)}</span>   <h2>${e(PRIMARY_CONTENT.text.h211)}</h2>
   <p>${e(PRIMARY_CONTENT.text.paragraph12)}</p>
         ${PRIMARY_CONTENT.localities.map((loc, i) => `      <h3>${e(PRIMARY_CONTENT.text.h33)} ${e(loc)}</h3>       ${PRIMARY_CONTENT.grades.map((g) => `<a href="${e("/admissions")}">  ${e(g)} ${e(PRIMARY_CONTENT.text.cta9)}</a>`).join("")}    `).join("")}       <a href="${e("https://maps.google.com/?q=Rainbow+International+School+Brahmand+Phase+4+Thane")}">  ${e(PRIMARY_CONTENT.text.cta10)}</a>   <a href="${e("https://wa.me/918291568972?text=Hi%2C%20I%20would%20like%20to%20enquire%20about%20Primary%20%28Class%201%E2%80%935%29%20admission%20at%20Rainbow%20International%20School.")}">  ${e(PRIMARY_CONTENT.text.cta11)}</a>   <a href="${e("/admissions")}">${e(PRIMARY_CONTENT.text.cta5)}  </a>      </section>
     <section>            <span>${e(PRIMARY_CONTENT.text.label7)}</span>   <h2>${e(PRIMARY_CONTENT.text.h212)}</h2>
   <p>${e(PRIMARY_CONTENT.text.paragraph13)}</p>
     <a href="${e("/admissions")}">${e(PRIMARY_CONTENT.text.cta1)}  </a>   <a href="${e("/admissions#campus-visit")}">${e(PRIMARY_CONTENT.text.cta2)}</a>   <a href="${e("https://wa.me/918291568972?text=Hi%2C%20I%20would%20like%20to%20enquire%20about%20Primary%20%28Class%201%E2%80%935%29%20admission%20at%20Rainbow%20International%20School.")}">  ${e(PRIMARY_CONTENT.text.cta3)}</a>   <a href="${e(`tel:${"+918291568972"}`)}">  ${e(PRIMARY_CONTENT.text.cta12)}</a>          </section>
     <section>      <h2>${e(PRIMARY_CONTENT.text.h213)}</h2>
   <p>${e(PRIMARY_CONTENT.text.paragraph14)}</p>
       ${PRIMARY_CONTENT.faqs.map(f => "<details><summary>" + e(f.q) + "</summary><p>" + e(f.a) + "</p></details>").join("")}      </section>`;
}

export function renderMiddleSchool(): string {
  return `<section>        <span>  ${e(MIDDLE_CONTENT.text.label1)}</span>       <p>${e(MIDDLE_CONTENT.text.heroDetail1)}</p>
     ${MIDDLE_CONTENT.inlineList1.map((t) => `<span>    ${e(t)}  </span>`).join("")}       <a href="${e("/admissions")}">${e(MIDDLE_CONTENT.text.cta1)}  </a>   <a href="${e("/admissions#campus-visit")}">${e(MIDDLE_CONTENT.text.cta2)}</a>   <a href="${e("https://wa.me/918291568972?text=Hi%2C%20I%20would%20like%20to%20enquire%20about%20Middle%20School%20%28Class%206%E2%80%938%29%20admission%20at%20Rainbow%20International%20School.")}">  ${e(MIDDLE_CONTENT.text.cta3)}</a>      </section>
       <section>      <span>${e(MIDDLE_CONTENT.text.label2)}</span>   <h2>${e(MIDDLE_CONTENT.text.h21)}</h2>
       ${MIDDLE_CONTENT.decisionCards.map((c, i) => `    <h3>${e(c.title)}</h3>   <p>${e(c.body)}</p>
  `).join("")}       <a href="${e("/admissions")}">${e(MIDDLE_CONTENT.text.cta4)}  </a>      </section>
     <section>      <h2>${e(MIDDLE_CONTENT.text.h22)}</h2>
   <p>${e(MIDDLE_CONTENT.text.paragraph1)}</p>
           ${MIDDLE_CONTENT.journey.map((j, i) => `  ${e(j.grade.replace("Class ", ""))}   <h3>${e(j.grade)}</h3>   <p>${e(j.body)}</p>
  `).join("")}           <a href="${e("/admissions")}">${e(MIDDLE_CONTENT.text.cta5)}  </a>      </section>
     <section>      <span>${e(MIDDLE_CONTENT.text.label3)}</span>   <h2>${e(MIDDLE_CONTENT.text.h23)}</h2>
   <p>${e(MIDDLE_CONTENT.text.paragraph2)}</p>
       ${MIDDLE_CONTENT.gradeAdmissions.map((g, i) => `  <span>${e(g.grade)}</span>   <h3>${e(g.title)}</h3>   <p>${e(g.body)}</p>
   <a href="${e("/admissions")}">${e(MIDDLE_CONTENT.text.cta6)}  </a>  `).join("")}      </section>
     <section>      <h2>${e(MIDDLE_CONTENT.text.h24)}</h2>
   <p>${e(MIDDLE_CONTENT.text.paragraph3)}</p>
           <h3>${e(MIDDLE_CONTENT.text.h31)}</h3>     <ul>  ${MIDDLE_CONTENT.scholastic.map(({ name }) => `<li>    <span>${e(name)}</span>  </li>`).join("")}  </ul>
         <h3>${e(MIDDLE_CONTENT.text.h32)}</h3>     <ul>  ${MIDDLE_CONTENT.coScholastic.map(({ name }) => `<li>    <span>${e(name)}</span>  </li>`).join("")}  </ul>
        </section>
     <section>      <h2>${e(MIDDLE_CONTENT.text.h25)}</h2>
   <p>${e(MIDDLE_CONTENT.text.paragraph4)}</p>
       ${MIDDLE_CONTENT.skills.map((s, i) => `    <h3>${e(s.title)}</h3>   <p>${e(s.body)}</p>
  `).join("")}      </section>
     <section>      <h2>${e(MIDDLE_CONTENT.text.h26)}</h2>
   <p>${e(MIDDLE_CONTENT.text.paragraph5)}</p>
             <p>${e(MIDDLE_CONTENT.text.paragraph6)}</p>
               <p>${e(MIDDLE_CONTENT.text.paragraph7)}</p>
             <p>${e(MIDDLE_CONTENT.text.paragraph8)}</p>
             ${MIDDLE_CONTENT.classroom.map((c, i) => `        <h3>${e(c.title)}</h3>   <p>${e(c.body)}</p>
      `).join("")}      </section>
     <section>      <h2>${e(MIDDLE_CONTENT.text.h27)}</h2>
       ${MIDDLE_CONTENT.approach.map((a, i) => `    <h3>${e(a.title)}</h3>   <p>${e(a.body)}</p>
  `).join("")}      </section>
     <section>      <span>${e(MIDDLE_CONTENT.text.label4)}</span>   <h2>${e(MIDDLE_CONTENT.text.h28)}</h2>
   <p>${e(MIDDLE_CONTENT.text.paragraph9)}</p>
       ${MIDDLE_CONTENT.evaluationPoints.map((pt, i) => `    <p>${e(pt)}</p>
  `).join("")}       <a href="${e("/admissions")}">${e(MIDDLE_CONTENT.text.cta7)}  </a>      </section>
     <section>      <h2>${e(MIDDLE_CONTENT.text.h29)}</h2>
   <p>${e(MIDDLE_CONTENT.text.paragraph10)}</p>
       ${MIDDLE_CONTENT.transitionCards.map((t, i) => `    <h3>${e(t.title)}</h3>   <p>${e(t.body)}</p>
  `).join("")}       <a href="${e("/secondary-section")}">${e(MIDDLE_CONTENT.text.cta8)}  </a>      </section>
     <section>      <span>${e(MIDDLE_CONTENT.text.label5)}</span>   <h2>${e(MIDDLE_CONTENT.text.h210)}</h2>
   <p>${e(MIDDLE_CONTENT.text.paragraph11)}</p>
       ${MIDDLE_CONTENT.localities.map((loc, i) => `  <h3>${e(MIDDLE_CONTENT.text.h33)} ${e(loc)}</h3>     ${MIDDLE_CONTENT.grades.map((g) => `<a href="${e("/admissions")}">  ${e(g)} ${e(MIDDLE_CONTENT.text.cta9)}</a>`).join("")}    `).join("")}       <a href="${e("https://maps.google.com/?q=Rainbow+International+School+Brahmand+Phase+4+Thane")}">  ${e(MIDDLE_CONTENT.text.cta10)}</a>   <a href="${e("https://wa.me/918291568972?text=Hi%2C%20I%20would%20like%20to%20enquire%20about%20Middle%20School%20%28Class%206%E2%80%938%29%20admission%20at%20Rainbow%20International%20School.")}">  ${e(MIDDLE_CONTENT.text.cta11)}</a>   <a href="${e("/admissions")}">${e(MIDDLE_CONTENT.text.cta5)}  </a>      </section>
     <section>            <span>${e(MIDDLE_CONTENT.text.label6)}</span>   <h2>${e(MIDDLE_CONTENT.text.h211)}</h2>
   <p>${e(MIDDLE_CONTENT.text.paragraph12)}</p>
     <a href="${e("/admissions")}">${e(MIDDLE_CONTENT.text.cta1)}  </a>   <a href="${e("/admissions#campus-visit")}">${e(MIDDLE_CONTENT.text.cta2)}</a>   <a href="${e("https://wa.me/918291568972?text=Hi%2C%20I%20would%20like%20to%20enquire%20about%20Middle%20School%20%28Class%206%E2%80%938%29%20admission%20at%20Rainbow%20International%20School.")}">  ${e(MIDDLE_CONTENT.text.cta3)}</a>   <a href="${e(`tel:${"+918291568972"}`)}">  ${e(MIDDLE_CONTENT.text.cta12)}</a>          </section>
     <section>      <h2>${e(MIDDLE_CONTENT.text.h212)}</h2>
   <p>${e(MIDDLE_CONTENT.text.paragraph13)}</p>
       ${MIDDLE_CONTENT.faqs.map(f => "<details><summary>" + e(f.q) + "</summary><p>" + e(f.a) + "</p></details>").join("")}      </section>`;
}

export function renderSecondary(): string {
  return `<section>        <span>  ${e(SECONDARY_CONTENT.text.label1)}</span>       <p>${e(SECONDARY_CONTENT.text.heroDetail1)}</p>
     ${SECONDARY_CONTENT.inlineList1.map((t) => `<span>    ${e(t)}  </span>`).join("")}       <a href="${e("/admissions")}">${e(SECONDARY_CONTENT.text.cta1)}  </a>   <a href="${e("/admissions#campus-visit")}">${e(SECONDARY_CONTENT.text.cta2)}</a>   <a href="${e("https://wa.me/918291568972?text=Hi%2C%20I%20would%20like%20to%20enquire%20about%20Secondary%20School%20%28Class%209%26%2010%29%20admission%20at%20Rainbow%20International%20School.")}">  ${e(SECONDARY_CONTENT.text.cta3)}</a>      </section>
       <section>      <span>${e(SECONDARY_CONTENT.text.label2)}</span>   <h2>${e(SECONDARY_CONTENT.text.h21)}</h2>
       ${SECONDARY_CONTENT.decisionCards.map((c, i) => `    <h3>${e(c.title)}</h3>   <p>${e(c.body)}</p>
  `).join("")}       <a href="${e("/admissions")}">${e(SECONDARY_CONTENT.text.cta4)}  </a>      </section>
     <section>      <h2>${e(SECONDARY_CONTENT.text.h22)}</h2>
   <p>${e(SECONDARY_CONTENT.text.paragraph1)}</p>
       ${SECONDARY_CONTENT.journey.map((j, i) => `    ${e(j.grade.replace("Class ", ""))}   <h3>${e(j.grade)}</h3>   <p>${e(j.body)}</p>
  `).join("")}       <a href="${e("/admissions")}">${e(SECONDARY_CONTENT.text.cta5)}  </a>      </section>
     <section>      <span>${e(SECONDARY_CONTENT.text.label3)}</span>   <h2>${e(SECONDARY_CONTENT.text.h23)}</h2>
       ${SECONDARY_CONTENT.gradeAdmissions.map((g, i) => `  <span>${e(g.grade)}</span>   <h3>${e(g.title)}</h3>   <p>${e(g.body)}</p>
   <a href="${e("/admissions")}">${e(SECONDARY_CONTENT.text.cta6)}  </a>  `).join("")}      </section>
     <section>      <h2>${e(SECONDARY_CONTENT.text.h24)}</h2>
   <p>${e(SECONDARY_CONTENT.text.paragraph2)}</p>
       ${SECONDARY_CONTENT.subjects.map(({ name }) => `    <p>${e(name)}</p>
  `).join("")}      </section>
     <section>      <span>${e(SECONDARY_CONTENT.text.label4)}</span>   <h2>${e(SECONDARY_CONTENT.text.h25)}</h2>
   <p>${e(SECONDARY_CONTENT.text.paragraph3)}</p>
       ${SECONDARY_CONTENT.boardReadiness.map((b, i) => `    <h3>${e(b.title)}</h3>  `).join("")}      </section>
     <section>      <h2>${e(SECONDARY_CONTENT.text.h26)}</h2>
       ${SECONDARY_CONTENT.studentDevelopment.map((s, i) => `    <h3>${e(s.title)}</h3>   <p>${e(s.body)}</p>
  `).join("")}      </section>
     <section>      <h2>${e(SECONDARY_CONTENT.text.h27)}</h2>
       ${SECONDARY_CONTENT.academicSupport.map((a, i) => `    <h3>${e(a.title)}</h3>   <p>${e(a.body)}</p>
  `).join("")}      </section>
     <section>      <span>${e(SECONDARY_CONTENT.text.label5)}</span>   <h2>${e(SECONDARY_CONTENT.text.h28)}</h2>
   <p>${e(SECONDARY_CONTENT.text.paragraph4)}</p>
       ${SECONDARY_CONTENT.evaluationPoints.map((pt, i) => `    <p>${e(pt)}</p>
  `).join("")}       <a href="${e("/admissions")}">${e(SECONDARY_CONTENT.text.cta7)}  </a>      </section>
     <section>      <h2>${e(SECONDARY_CONTENT.text.h29)}</h2>
   <p>${e(SECONDARY_CONTENT.text.paragraph5)}</p>
       ${SECONDARY_CONTENT.transitionCards.map((t, i) => `    <h3>${e(t.title)}</h3>   <p>${e(t.body)}</p>
  `).join("")}       <a href="${e("/senior-secondary-section")}">${e(SECONDARY_CONTENT.text.cta8)}  </a>      </section>
     <section>      <span>${e(SECONDARY_CONTENT.text.label6)}</span>   <h2>${e(SECONDARY_CONTENT.text.h210)}</h2>
   <p>${e(SECONDARY_CONTENT.text.paragraph6)}</p>
       ${SECONDARY_CONTENT.localities.map((loc, i) => `  <h3>${e(SECONDARY_CONTENT.text.h31)} ${e(loc)}</h3>     ${SECONDARY_CONTENT.grades.map((g) => `<a href="${e("/admissions")}">  ${e(g)} ${e(SECONDARY_CONTENT.text.cta9)}</a>`).join("")}    `).join("")}       <a href="${e("https://maps.google.com/?q=Rainbow+International+School+Brahmand+Phase+4+Thane")}">  ${e(SECONDARY_CONTENT.text.cta10)}</a>   <a href="${e("https://wa.me/918291568972?text=Hi%2C%20I%20would%20like%20to%20enquire%20about%20Secondary%20School%20%28Class%209%26%2010%29%20admission%20at%20Rainbow%20International%20School.")}">  ${e(SECONDARY_CONTENT.text.cta11)}</a>   <a href="${e("/admissions")}">${e(SECONDARY_CONTENT.text.cta5)}  </a>      </section>
     <section>            <span>${e(SECONDARY_CONTENT.text.label7)}</span>   <h2>${e(SECONDARY_CONTENT.text.h211)}</h2>
   <p>${e(SECONDARY_CONTENT.text.paragraph7)}</p>
     <a href="${e("/admissions")}">${e(SECONDARY_CONTENT.text.cta1)}  </a>   <a href="${e("/admissions#campus-visit")}">${e(SECONDARY_CONTENT.text.cta2)}</a>   <a href="${e("https://wa.me/918291568972?text=Hi%2C%20I%20would%20like%20to%20enquire%20about%20Secondary%20School%20%28Class%209%26%2010%29%20admission%20at%20Rainbow%20International%20School.")}">  ${e(SECONDARY_CONTENT.text.cta3)}</a>   <a href="${e(`tel:${"+918291568972"}`)}">  ${e(SECONDARY_CONTENT.text.cta12)}</a>          </section>
     <section>      <h2>${e(SECONDARY_CONTENT.text.h212)}</h2>
   <p>${e(SECONDARY_CONTENT.text.paragraph8)}</p>
       ${SECONDARY_CONTENT.faqs.map(f => "<details><summary>" + e(f.q) + "</summary><p>" + e(f.a) + "</p></details>").join("")}      </section>`;
}

export function renderSeniorSecondary(): string {
  return `<section>        <span>  ${e(SENIOR_CONTENT.text.label1)}</span>       <p>${e(SENIOR_CONTENT.text.heroDetail1)}</p>
     ${SENIOR_CONTENT.inlineList1.map((t) => `<span>    ${e(t)}  </span>`).join("")}       <a href="${e("/admissions")}">${e(SENIOR_CONTENT.text.cta1)}  </a>   <a href="${e("/admissions#campus-visit")}">${e(SENIOR_CONTENT.text.cta2)}</a>   <a href="${e("https://wa.me/918291568972?text=Hi%2C%20I%20would%20like%20to%20enquire%20about%20Senior%20Secondary%20%28Class%2011%26%2012%29%20admission%20at%20Rainbow%20International%20School.")}">  ${e(SENIOR_CONTENT.text.cta3)}</a>      </section>
       <section>      <span>${e(SENIOR_CONTENT.text.label2)}</span>   <h2>${e(SENIOR_CONTENT.text.h21)}</h2>
       ${SENIOR_CONTENT.decisionCards.map((c, i) => `    <h3>${e(c.title)}</h3>   <p>${e(c.body)}</p>
  `).join("")}       <a href="${e("/admissions")}">${e(SENIOR_CONTENT.text.cta4)}  </a>      </section>
     <section>      <h2>${e(SENIOR_CONTENT.text.h22)}</h2>
   <p>${e(SENIOR_CONTENT.text.paragraph1)}</p>
       ${SENIOR_CONTENT.journey.map((j, i) => `    ${e(j.grade.replace("Class ", ""))}   <h3>${e(j.grade)}</h3>   <p>${e(j.body)}</p>
  `).join("")}       <a href="${e("/admissions")}">${e(SENIOR_CONTENT.text.cta5)}  </a>      </section>
     <section>      <span>${e(SENIOR_CONTENT.text.label3)}</span>   <h2>${e(SENIOR_CONTENT.text.h23)}</h2>
       ${SENIOR_CONTENT.gradeAdmissions.map((g, i) => `  <span>${e(g.grade)}</span>   <h3>${e(g.title)}</h3>   <p>${e(g.body)}</p>
   <a href="${e("/admissions")}">${e(SENIOR_CONTENT.text.cta6)}  </a>  `).join("")}      </section>
     <section>      <h2>${e(SENIOR_CONTENT.text.h24)}</h2>
   <p>${e(SENIOR_CONTENT.text.paragraph2)}</p>
       ${SENIOR_CONTENT.streams.map((s, i) => `      <h3>${e(s.name)}</h3>   <p>${e(s.description)}</p>
         <p>${e(SENIOR_CONTENT.text.paragraph3)}</p>
   <p>${e(s.suitable)}</p>
       <p>${e(SENIOR_CONTENT.text.paragraph4)}</p>
   <p>${e(s.direction)}</p>
       <p>${e(SENIOR_CONTENT.text.paragraph5)}</p>
   <p>${e(s.skills)}</p>
       <p>${e(SENIOR_CONTENT.text.paragraph6)}</p>
   <p>${e(s.pathways)}</p>
         <a href="${e("/admissions")}">${e(SENIOR_CONTENT.text.cta7)}  </a>    `).join("")}      </section>
     <section>      <span>${e(SENIOR_CONTENT.text.label4)}</span>   <h2>${e(SENIOR_CONTENT.text.h25)}</h2>
   <p>${e(SENIOR_CONTENT.text.paragraph7)}</p>
       ${SENIOR_CONTENT.boardSupport.map((b, i) => `    <h3>${e(b.title)}</h3>  `).join("")}      </section>
     <section>      <h2>${e(SENIOR_CONTENT.text.h26)}</h2>
       ${SENIOR_CONTENT.careerCards.map((c, i) => `    <h3>${e(c.title)}</h3>   <p>${e(c.body)}</p>
  `).join("")}      </section>
     <section>      <h2>${e(SENIOR_CONTENT.text.h27)}</h2>
   <p>${e(SENIOR_CONTENT.text.paragraph8)}</p>
       ${SENIOR_CONTENT.beyondAcademics.map((b, i) => `    <p>${e(b.title)}</p>
  `).join("")}      </section>
     <section>      <span>${e(SENIOR_CONTENT.text.label5)}</span>   <h2>${e(SENIOR_CONTENT.text.h28)}</h2>
   <p>${e(SENIOR_CONTENT.text.paragraph9)}</p>
       ${SENIOR_CONTENT.evaluationPoints.map((pt, i) => `    <p>${e(pt)}</p>
  `).join("")}       <a href="${e("/admissions")}">${e(SENIOR_CONTENT.text.cta8)}  </a>      </section>
     <section>      <h2>${e(SENIOR_CONTENT.text.h29)}</h2>
   <p>${e(SENIOR_CONTENT.text.paragraph10)}</p>
       ${SENIOR_CONTENT.futureCards.map((t, i) => `    <h3>${e(t.title)}</h3>   <p>${e(t.body)}</p>
  `).join("")}       <a href="${e("/admissions")}">${e(SENIOR_CONTENT.text.cta1)}  </a>      </section>
     <section>      <span>${e(SENIOR_CONTENT.text.label6)}</span>   <h2>${e(SENIOR_CONTENT.text.h210)}</h2>
   <p>${e(SENIOR_CONTENT.text.paragraph11)}</p>
       ${SENIOR_CONTENT.localities.map((loc, i) => `  <h3>${e(SENIOR_CONTENT.text.h31)} ${e(loc)}</h3>     ${SENIOR_CONTENT.grades.map((g) => `<a href="${e("/admissions")}">  ${e(g)} ${e(SENIOR_CONTENT.text.cta9)}</a>`).join("")}    `).join("")}       <a href="${e("https://maps.google.com/?q=Rainbow+International+School+Brahmand+Phase+4+Thane")}">  ${e(SENIOR_CONTENT.text.cta10)}</a>   <a href="${e("https://wa.me/918291568972?text=Hi%2C%20I%20would%20like%20to%20enquire%20about%20Senior%20Secondary%20%28Class%2011%26%2012%29%20admission%20at%20Rainbow%20International%20School.")}">  ${e(SENIOR_CONTENT.text.cta11)}</a>   <a href="${e("/admissions")}">${e(SENIOR_CONTENT.text.cta5)}  </a>      </section>
     <section>            <span>${e(SENIOR_CONTENT.text.label7)}</span>   <h2>${e(SENIOR_CONTENT.text.h211)}</h2>
   <p>${e(SENIOR_CONTENT.text.paragraph12)}</p>
     <a href="${e("/admissions")}">${e(SENIOR_CONTENT.text.cta1)}  </a>   <a href="${e("/admissions#campus-visit")}">${e(SENIOR_CONTENT.text.cta2)}</a>   <a href="${e("https://wa.me/918291568972?text=Hi%2C%20I%20would%20like%20to%20enquire%20about%20Senior%20Secondary%20%28Class%2011%26%2012%29%20admission%20at%20Rainbow%20International%20School.")}">  ${e(SENIOR_CONTENT.text.cta3)}</a>   <a href="${e(`tel:${"+918291568972"}`)}">  ${e(SENIOR_CONTENT.text.cta12)}</a>          </section>
     <section>      <h2>${e(SENIOR_CONTENT.text.h212)}</h2>
   <p>${e(SENIOR_CONTENT.text.paragraph13)}</p>
       ${SENIOR_CONTENT.faqs.map(f => "<details><summary>" + e(f.q) + "</summary><p>" + e(f.a) + "</p></details>").join("")}      </section>`;
}
