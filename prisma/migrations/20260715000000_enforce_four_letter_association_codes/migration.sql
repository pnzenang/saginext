ALTER TABLE "Profile"
ADD CONSTRAINT "Profile_associationCode_four_letters_chk"
CHECK ("associationCode" ~ '^[A-Z]{4}$') NOT VALID;

ALTER TABLE "Member"
ADD CONSTRAINT "Member_associationCode_four_letters_chk"
CHECK ("associationCode" ~ '^[A-Z]{4}$') NOT VALID;
