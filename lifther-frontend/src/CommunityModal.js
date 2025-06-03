import React from 'react';
import './CommunityModal.css';

const resources = [
  {
    title: 'National Helpline for Women',
    desc: '24x7 helpline for women in distress. Call for legal, medical, and emotional support.',
    link: 'https://www.ncw.nic.in/helplines',
  },
  {
    title: 'Single Mother Support Group (Facebook)',
    desc: 'Join a community of single mothers for emotional and practical support.',
    link: 'https://www.facebook.com/groups/singlemothersupport/',
  },
  {
    title: 'Legal Aid Services',
    desc: 'Find free and affordable legal help for women and children.',
    link: 'https://nalsa.gov.in/',
  },
  {
    title: 'Scholarships for Children',
    desc: 'Explore scholarships and education grants for children of single mothers.',
    link: 'https://www.buddy4study.com/',
  },
  {
    title: 'Mental Health India',
    desc: 'Access mental health resources and helplines for emotional support.',
    link: 'https://mentalhealthindia.org/',
  },
];

const CommunityModal = ({ onClose }) => (
  <div className="community-modal-backdrop">
    <div className="community-modal">
      <button className="community-modal-close" onClick={onClose}>&times;</button>
      <h2>Community & Resources</h2>
      <p className="community-modal-desc">Find support, resources, and inspiration for single mothers and their children.</p>
      <div className="community-modal-list">
        {resources.map((r, i) => (
          <a className="community-modal-card" href={r.link} target="_blank" rel="noopener noreferrer" key={i}>
            <div className="community-modal-card-title">{r.title}</div>
            <div className="community-modal-card-desc">{r.desc}</div>
            <div className="community-modal-card-link">Visit &rarr;</div>
          </a>
        ))}
      </div>
    </div>
  </div>
);

export default CommunityModal; 