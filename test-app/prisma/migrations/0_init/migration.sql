-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255),
    "email" VARCHAR(255),
    "age" INTEGER,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

