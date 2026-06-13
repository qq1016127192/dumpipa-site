-- 创建分站管理员账号
-- 用户名: admin
-- 密码: 123456

USE dumpipa_site;

INSERT INTO users (username, password, email, is_admin, balance, status, created_at) 
VALUES (
  'admin', 
  '$2b$10$DZCP/cPcFp2XhNKQlQJVGeFPZxb9kmTUvMf3ui1nqbW8c6ZAFnKPe', 
  'admin@example.com', 
  1, 
  1000.00, 
  1, 
  NOW()
);

