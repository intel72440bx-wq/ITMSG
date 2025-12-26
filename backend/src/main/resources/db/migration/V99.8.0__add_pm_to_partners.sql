-- 파트너와 PM 간의 다대다 관계를 위한 중간 테이블 생성
CREATE TABLE partner_pms (
    partner_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    PRIMARY KEY (partner_id, user_id),
    FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 인덱스 추가
CREATE INDEX idx_partner_pms_partner_id ON partner_pms(partner_id);
CREATE INDEX idx_partner_pms_user_id ON partner_pms(user_id);
