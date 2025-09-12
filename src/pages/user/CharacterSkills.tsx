import React, { useState, useEffect } from 'react';
import {
  Card,
  Col,
  Row,
  Collapse,
  Button
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronDown
} from '@fortawesome/free-solid-svg-icons';
import SkillLevel from 'components/common/SkillLevel';
import SkillBar from 'components/common/SkillBar';

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

const CharacterSkills: React.FC<CharacterSkillsProps> = ({ skillsData }) => {
  const [view, setView] = useState<string>();
  const [charTotalSp, setCharTotalSp] = useState<number | null>(null);
  const [skillTree, setSkillTree] = useState<SkillCategory[] | null>(null);
  const [skillRowOne, setSkillRowOne] = useState<SkillCategory[] | null>(null);
  const [skillRowTwo, setSkillRowTwo] = useState<SkillCategory[] | null>(null);
  const [skillRowThree, setSkillRowThree] = useState<SkillCategory[] | null>(null);

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

  return (
    <Card className="mb-3">
      <Card.Header className="bg-body-tertiary">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-1 mb-md-0">Skill Catalogue</h5>
          {charTotalSp && <h6 className="mb-0">{formatNumber(charTotalSp)} Total SP</h6>}
        </div>
      </Card.Header>

      <Card.Body className="text-1000">
        <Row className="g-1">
          <Col xs={6} md={4} lg={4}>
            {skillRowOne &&
              skillRowOne.map(skill => (
                <div key={`${skill.category}`} className="mb-1">
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
                <div key={`${skill.category}`} className="mb-1">
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
                <div key={`${skill.category}`} className="mb-1">
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
        {skillTree && skillTree.map(category => {
          // Sort skills by name
          const sortedSkills = category.skills ? [...category.skills].sort((a, b) => {
            const nameA = (a.name || a.skill_name || '').toLowerCase();
            const nameB = (b.name || b.skill_name || '').toLowerCase();
            return nameA.localeCompare(nameB);
          }) : [];

          return (
            <Collapse key={category.category} in={view === category.category}>
              <Row className="mt-3">
                {sortedSkills.length > 0 && (
                  <>
                    <Col xs={6} md={6}>
                      {sortedSkills.slice(0, Math.ceil(sortedSkills.length / 2)).map(skill => (
                        <SkillLevel 
                          key={skill.skillId || skill.skill_id} 
                          name={skill.name || skill.skill_name || 'Unknown Skill'} 
                          level={skill.active_skill_level || 0} 
                        />
                      ))}
                    </Col>
                    <Col xs={6} md={6}>
                      {sortedSkills.slice(Math.ceil(sortedSkills.length / 2)).map(skill => (
                        <SkillLevel 
                          key={skill.skillId || skill.skill_id} 
                          name={skill.name || skill.skill_name || 'Unknown Skill'} 
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
        <Button
          variant="link"
          onClick={() => setView(undefined)}
        >
          {view ? 'Show less' : ''}
          <FontAwesomeIcon 
            icon={faChevronDown} 
            className="ms-2 fs-11" 
            transform={view ? 'rotate-180' : ''} 
          />
        </Button>
      </Card.Footer>
    </Card>
  );
};

export default CharacterSkills;