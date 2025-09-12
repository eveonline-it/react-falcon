import React, { useState, useEffect } from 'react';
import { Card, Col, Row, Collapse, Button, ProgressBar, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faClock, faGraduationCap } from '@fortawesome/free-solid-svg-icons';
import SkillLevel from 'components/common/SkillLevel';
import SkillBar from 'components/common/SkillBar';
import { useCharacterSkillQueue } from 'hooks/useUserCharacters';

interface Skill {
  skillId?: number;
  skill_id?: number;
  name?: string;
  skill_name?: string;
  active_skill_level?: number;
}

interface SkillCategory {
  category: string;
  skillId?: number;
  skills: Skill[];
  total_sp_in_category: number;
  max_category_sp: number;
  percent_fulfilled: string;
}

interface SkillTreeData {
  skill_tree: SkillCategory[];
  total_sp: number;
}

interface SkillQueueItem {
  skill_id: number;
  skill_name: string;
  finished_level: number;
  start_date?: string;
  finish_date?: string;
  level_start_sp?: number;
  level_end_sp?: number;
  training_start_sp?: number;
  queue_position: number;
}

interface SkillQueueData {
  character_id: number;
  skills: SkillQueueItem[];
}

interface CharacterSkillsProps {
  characterId?: string;
  skillsData?: SkillTreeData;
}

function sortSkills(skills: SkillCategory[]) {
  skills.sort((a, b) => {
    // Convert names to lowercase for case-insensitive sorting
    const nameA = a.category.toLowerCase();
    const nameB = b.category.toLowerCase();
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    return 0;
  });
  return skills;
}

const CharacterSkills: React.FC<CharacterSkillsProps> = ({ characterId, skillsData }) => {
  const { data: skillQueueData } = useCharacterSkillQueue(characterId);
  const skillQueue = skillQueueData?.skills || skillQueueData || [];
  const [view, setView] = useState<string>();
  const [skillQueueExpanded, setSkillQueueExpanded] = useState(false);
  const [charTotalSp, setCharTotalSp] = useState<number | null>(null);
  const [skillTree, setSkillTree] = useState<SkillCategory[] | null>(null);
  const [skillRowOne, setSkillRowOne] = useState<SkillCategory[] | null>(null);
  const [skillRowTwo, setSkillRowTwo] = useState<SkillCategory[] | null>(null);
  const [skillRowThree, setSkillRowThree] = useState<SkillCategory[] | null>(
    null
  );

  useEffect(() => {
    if (skillsData?.skill_tree && skillsData?.total_sp) {
      const skillTreeRaw = skillsData.skill_tree;
      const skillTreeSorted = [...skillTreeRaw];
      sortSkills(skillTreeSorted);
      setCharTotalSp(skillsData.total_sp);
      setSkillTree(skillTreeSorted);
      const skillRowOne = skillTreeSorted.slice(0, 8);
      setSkillRowOne(skillRowOne);
      const skillRowTwo = skillTreeSorted.slice(8, 16);
      setSkillRowTwo(skillRowTwo);
      const skillRowThree = skillTreeSorted.slice(16, 24);
      setSkillRowThree(skillRowThree);
    } else {
      setCharTotalSp(null);
      setSkillTree(null);
      setSkillRowOne(null);
      setSkillRowTwo(null);
      setSkillRowThree(null);
    }
  }, [skillsData]);

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const calculateTimeRemaining = (finishDate: string) => {
    if (!finishDate) return 'N/A';
    const now = new Date();
    const finish = new Date(finishDate);
    const diff = finish.getTime() - now.getTime();
    
    if (diff <= 0) return 'Completed';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const calculateProgress = (item: SkillQueueItem) => {
    if (!item.start_date || !item.finish_date) return 0;
    
    const now = new Date();
    const start = new Date(item.start_date);
    const finish = new Date(item.finish_date);
    
    const totalTime = finish.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    
    if (elapsed <= 0) return 0;
    if (elapsed >= totalTime) return 100;
    
    return Math.floor((elapsed / totalTime) * 100);
  };

  return (
    <>
      <Card className="mb-3">
      <Card.Header className="bg-body-tertiary">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-1 mb-md-0">Skill Catalogue</h5>
          {charTotalSp && (
            <h6 className="mb-0">{formatNumber(charTotalSp)} Total SP</h6>
          )}
        </div>
      </Card.Header>

      <Card.Body className="text-1000">
        <Row className="g-1">
          <Col xs={6} md={4} lg={4}>
            {skillRowOne &&
              skillRowOne.map(skill => (
                <div key={`${skill.category}`} className="">
                  <SkillBar
                    name={skill.category}
                    sp={skill.total_sp_in_category}
                    maxsp={skill.max_category_sp}
                    level={parseInt(skill.percent_fulfilled)}
                    open={(x: string) => setView(x)}
                  />
                </div>
              ))}
          </Col>
          <Col xs={6} md={4} lg={4}>
            {skillRowTwo &&
              skillRowTwo.map(skill => (
                <div key={`${skill.category}`} className="">
                  <SkillBar
                    name={skill.category}
                    sp={skill.total_sp_in_category}
                    maxsp={skill.max_category_sp}
                    level={parseInt(skill.percent_fulfilled)}
                    open={(x: string) => setView(x)}
                  />
                </div>
              ))}
          </Col>
          <Col xs={6} md={4} lg={4}>
            {skillRowThree &&
              skillRowThree.map(skill => (
                <div key={`${skill.category}`} className="">
                  <SkillBar
                    name={skill.category}
                    sp={skill.total_sp_in_category}
                    maxsp={skill.max_category_sp}
                    level={parseInt(skill.percent_fulfilled)}
                    open={(x: string) => setView(x)}
                  />
                </div>
              ))}
          </Col>
        </Row>

        {/* Collapsible sections for each skill category */}
        {skillTree &&
          skillTree.map(category => {
            // Sort skills by name
            const sortedSkills = category.skills
              ? [...category.skills].sort((a, b) => {
                  const nameA = (a.name || a.skill_name || '').toLowerCase();
                  const nameB = (b.name || b.skill_name || '').toLowerCase();
                  return nameA.localeCompare(nameB);
                })
              : [];

            return (
              <Collapse key={category.category} in={view === category.category}>
                <Row className="mt-3">
                  {sortedSkills.length > 0 && (
                    <>
                      <Col xs={6} md={6}>
                        {sortedSkills
                          .slice(0, Math.ceil(sortedSkills.length / 2))
                          .map(skill => (
                            <SkillLevel
                              key={skill.skillId || skill.skill_id}
                              name={
                                skill.name ||
                                skill.skill_name ||
                                'Unknown Skill'
                              }
                              level={skill.active_skill_level || 0}
                            />
                          ))}
                      </Col>
                      <Col xs={6} md={6}>
                        {sortedSkills
                          .slice(Math.ceil(sortedSkills.length / 2))
                          .map(skill => (
                            <SkillLevel
                              key={skill.skillId || skill.skill_id}
                              name={
                                skill.name ||
                                skill.skill_name ||
                                'Unknown Skill'
                              }
                              level={skill.active_skill_level || 0}
                            />
                          ))}
                      </Col>
                    </>
                  )}
                </Row>
              </Collapse>
            );
          })}
      </Card.Body>

      <Card.Footer className="bg-body-tertiary p-0 border-top d-grid">
        <Button variant="link" onClick={() => setView(undefined)}>
          {view ? 'Show less' : ''}
          <FontAwesomeIcon
            icon={faChevronDown}
            className="ms-2 fs-11"
            transform={view ? 'rotate-180' : ''}
          />
        </Button>
      </Card.Footer>
    </Card>

    {/* Skill Queue Card */}
    <Card className="mb-3">
      <Card.Header 
        className="bg-body-tertiary" 
        style={{ cursor: 'pointer' }}
        onClick={() => setSkillQueueExpanded(!skillQueueExpanded)}
      >
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-1 mb-md-0">
            <FontAwesomeIcon icon={faGraduationCap} className="me-2" />
            Skill Queue
            <FontAwesomeIcon 
              icon={faChevronDown} 
              className="ms-2 fs-11" 
              transform={skillQueueExpanded ? 'rotate-180' : ''}
            />
          </h5>
          {skillQueue && Array.isArray(skillQueue) && skillQueue.length > 0 && (
            <Badge bg="primary" pill>
              {skillQueue.length} {skillQueue.length === 1 ? 'skill' : 'skills'}
            </Badge>
          )}
        </div>
      </Card.Header>

      <Collapse in={skillQueueExpanded}>
        <div>
      <Card.Body className="text-1000">
        {skillQueue && Array.isArray(skillQueue) && skillQueue.length > 0 ? (
          <div className="skill-queue">
            {skillQueue.map((item: SkillQueueItem, index: number) => {
              const progress = calculateProgress(item);
              const timeRemaining = calculateTimeRemaining(item.finish_date || '');
              const isActive = index === 0 && progress > 0 && progress < 100;
              
              return (
                <div key={`${item.skill_id}-${item.queue_position}`} className="mb-3">
                  <div className="d-flex justify-content-between align-items-start mb-1">
                    <div>
                      <span className="fw-semibold">
                        {item.skill_name || `Skill ${item.skill_id}`}
                      </span>
                      <span className="ms-2 text-600">
                        Level {item.finished_level}
                      </span>
                      {isActive && (
                        <Badge bg="success" className="ms-2">
                          Training
                        </Badge>
                      )}
                    </div>
                    <div className="text-end">
                      <small className="text-600">
                        <FontAwesomeIcon icon={faClock} className="me-1" />
                        {timeRemaining}
                      </small>
                    </div>
                  </div>
                  
                  <ProgressBar 
                    now={progress} 
                    variant={isActive ? 'primary' : 'secondary'}
                    animated={isActive}
                    striped={isActive}
                    style={{ height: '8px' }}
                  />
                  
                  {index < skillQueue.length - 1 && (
                    <hr className="my-2" style={{ opacity: 0.2 }} />
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-4">
            <FontAwesomeIcon icon={faGraduationCap} size="3x" className="text-300 mb-3" />
            <p className="text-600 mb-0">
              {skillQueueData === undefined ? 'Loading skill queue...' : 'No skills in training queue'}
            </p>
          </div>
        )}
      </Card.Body>
        </div>
      </Collapse>
    </Card>
    </>
  );
};

export default CharacterSkills;
