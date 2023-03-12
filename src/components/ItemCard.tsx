import { Box, Card, CardContent, CardMedia, Grid, Typography } from "@mui/material"
import { styled } from '@mui/material/styles';

import CompanyItemBG from "../assets/img/misc/companyitem_bg.jpg";
import ScavengerBG from "../assets/img/misc/scavenger_bg.jpg";
import ArtifactBG from "../assets/img/misc/artifact_bg.png";


enum ItemCategory { COMPANY = 0, ARTIFACT, SCAVENGER }
enum ItemType { CONSUMABLE = 0, HEALTH, CARRY, DEFENSE, HACK, BREACH, HAZARD, ARMOR, RANGED, MELEE, SPECIAL }

const ItemOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  left: '0',
  top: '0',
  zIndex: 1299,
  background: 'transparent',
}));

export interface ItemDataInterface {
  genHash: string,
  id: number,
  uifID: number,
  holdingPlayerId: number,

  weight: number,

  traitModID: number,

  itemCategory: ItemCategory,

  grantsAbility: number,
  grantsFlaw: number,

  itemType: ItemType,

  power: number,

  inGame: boolean
}

const ItemCategoryToString = new Map([
  [ItemCategory.COMPANY, "Company"],
  [ItemCategory.ARTIFACT, "Artifact"],
  [ItemCategory.SCAVENGER, "Scavenger"]
]);

const ItemTypeToString = new Map([
  [ItemType.CONSUMABLE, "Consumable"],
  [ItemType.HEALTH, "Health"],
  [ItemType.CARRY, "Backpack"],
  [ItemType.DEFENSE, "Kevlar"],
  [ItemType.HACK, "Hackatron"],
  [ItemType.HEALTH, "Crowbar"],
  [ItemType.HAZARD, "Hazmat"],
  [ItemType.ARMOR, "Armor"],
  [ItemType.RANGED, "Gun"],
  [ItemType.MELEE, "Sword"],
  [ItemType.SPECIAL, "Special"],
]);

export default function ItemCard(props: ItemDataInterface) {

  function getItemBg() {
    switch (props.itemCategory) {
      case 0:
        return CompanyItemBG;
      case 1:
        return ArtifactBG;
      case 2:
        return ScavengerBG;
    }
  }

  return (
    <Card sx={{ position: 'relative' }}>
      <CardMedia
        image={getItemBg()}
        component="img"
      />
      <ItemOverlay>
        <Grid container spacing={0}>
          <Grid item xs={12}>
            <Typography variant="body1" color="black">
              {props.genHash.slice(4, 8) + "/" + props.id.toString()}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body1" color="black">
              {"Wt " + props.weight.toString()}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body1" color="black">
              {ItemTypeToString.get(props.itemType)}
            </Typography>
          </Grid>
          <Grid item xs={12}>
              <Typography variant="body1" color="black">
                  {"Pwr " + props.power.toString()}
              </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body1" color="black">
              {ItemCategoryToString.get(props.itemCategory)}
            </Typography>
          </Grid>
        </Grid>
      </ItemOverlay>
    </Card>
  )
}
