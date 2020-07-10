import React from "react";
import clsx from "clsx";
import Layout from "./../components/Layout";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import useBaseUrl from "@docusaurus/useBaseUrl";
import styles from "./styles.module.css";
import {
  SimpleGrid,
  Box,
  Text,
  Button,
  List,
  ListItem,
  ListIcon,
  Flex
} from "@chakra-ui/core";

function Home() {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;
  return (
    <Layout title="Pricing" description="SpreadSheets pricing">
      <Box className="container" pt={10}>
        <Text
          textAlign="center"
          as="h1"
          fontWeight="bold"
          fontSize="3xl"
          pb={5}
        >
          SpreadSheet Pricing
        </Text>
        <SimpleGrid
          columns={[1, 1, 2]}
          width={["auto", "auto", 800]}
          margin="auto"
          spacing={10}
          alignItem="center"
        >
          <Box shadow="md" p={4} mb={5}>
            <Box textAlign="center">
              <Text fontWeight="bold" pb={5} fontSize="2xl">
                Non-commercial
              </Text>
              <Text fontSize="xl">Free</Text>
            </Box>

            <List pt={5} maxWidth={300} margin="auto">
              <ListItem pb={2}>
                <Flex>
                  <ListIcon mt={1} icon="check-circle" color="green.500" />
                  Non-commerical use. Perfect for open source and hobby projects
                </Flex>
              </ListItem>
              <ListItem pb={2}>
                <Flex>
                  <ListIcon mt={1} icon="check-circle" color="green.500" />
                  Community support
                </Flex>
              </ListItem>
              <ListItem pb={2}>
                <Flex>
                  <ListIcon mt={1} icon="check-circle" color="green.500" />
                  All features
                </Flex>
              </ListItem>
              <ListItem pb={2}>
                <Flex>
                  <ListIcon mt={1} icon="check-circle" color="green.500" />
                  Source code available
                </Flex>
              </ListItem>
            </List>
          </Box>
          <Box shadow="md" p={4} mb={5}>
            <Box textAlign="center">
              <Text fontWeight="bold" pb={5} fontSize="2xl">
                Developer license
              </Text>
              <Text fontSize="xl">$199</Text>
            </Box>

            <List pt={5} pb={8} maxWidth={300} margin="auto">
              <ListItem pb={2}>
                <Flex>
                  <ListIcon mt={1} icon="check-circle" color="green.500" />
                  Single application
                </Flex>
              </ListItem>
              <ListItem pb={2}>
                <Flex>
                  <ListIcon mt={1} icon="check-circle" color="green.500" />
                  Perpetual license
                </Flex>
              </ListItem>
              <ListItem pb={2}>
                <Flex>
                  <ListIcon mt={1} icon="check-circle" color="green.500" />
                  All features
                </Flex>
              </ListItem>
              <ListItem pb={2}>
                <Flex>
                  <ListIcon mt={1} icon="check-circle" color="green.500" />
                  Source code available
                </Flex>
              </ListItem>
              <ListItem pb={2}>
                <Flex>
                  <ListIcon icon="check-circle" color="green.500" />1 year of
                  FREE support from the Core team.
                </Flex>
              </ListItem>
            </List>

            <Button
              variantColor="purple"
              width={200}
              margin="auto"
              display="block"
              textAlign="center"
              href="/checkout"
              as="a"
              lineHeight="40px"
              mb={5}
              _hover={{
                color: "white",
                opacity: 0.9,
                textDecoration: "none"
              }}
            >
              Buy
            </Button>
          </Box>
        </SimpleGrid>
      </Box>
    </Layout>
  );
}

export default Home;
